import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateLibraryEventDto } from './dto/create-library-event.dto';
import { UpdateLibraryEventDto } from './dto/update-library-event.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LibraryEvent } from './entities/library-event.entity';
import { LibraryEventRegistration } from './entities/library-event-registrations.entity';
import { User } from 'src/users/entities/user.entity';
import { RegisterEventDto } from './dto/register-event.dto';

@Injectable()
export class LibraryEventsService {
  constructor(
    @InjectRepository(LibraryEvent)
    private readonly libraryEventsRepository: Repository<LibraryEvent>,
    @InjectRepository(LibraryEventRegistration)
    private readonly registrationRepository: Repository<LibraryEventRegistration>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createLibraryEventDto: CreateLibraryEventDto) {
    const libraryEvent = this.libraryEventsRepository.create(
      createLibraryEventDto,
    );
    const result = await this.libraryEventsRepository.save(libraryEvent);
    return result;
  }

  async registerForEvent(eventId: number, registerDto: RegisterEventDto) {
    const event = await this.libraryEventsRepository.findOne({
      where: { id: eventId },
      relations: ['registrations'],
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    if (event.registrations.length >= event.seats) {
      throw new BadRequestException('Event is already full');
    }

    if (event.date < new Date()) {
      throw new BadRequestException('Event has already occurred');
    }

    const user = await this.userRepository.findOneBy({
      id: registerDto.userId,
    });
    if (!user) {
      throw new NotFoundException(
        `User with ID ${registerDto.userId} not found`,
      );
    }

    const existingRegistration = await this.registrationRepository.findOne({
      where: {
        event: { id: eventId },
        user: { id: user.id },
      },
    });

    if (existingRegistration) {
      throw new BadRequestException(
        'User is already registered for this event',
      );
    }

    const registration = this.registrationRepository.create({
      event,
      user,
    });

    await this.registrationRepository.save(registration);

    return {
      message: 'Successfully registered for the event',
      registrationId: registration.id,
      eventTitle: event.title,
      userName: user.name,
    };
  }

  async getEventRegistrations(eventId: number) {
    const event = await this.libraryEventsRepository.findOne({
      where: { id: eventId },
      relations: ['registrations', 'registrations.user'],
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    return {
      eventTitle: event.title,
      totalSeats: event.seats,
      registeredUsers: event.registrations.length,
      availableSeats: event.seats - event.registrations.length,
      registrations: event.registrations.map((reg) => ({
        id: reg.id,
        userId: reg.user.id,
        userName: reg.user.name,
        registeredAt: reg.registeredAt,
        attended: reg.attended,
      })),
    };
  }

  async cancelRegistration(eventId: number, userId: number) {
    const registration = await this.registrationRepository.findOne({
      where: {
        event: { id: eventId },
        user: { id: userId },
      },
      relations: ['event'],
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    if (registration.event.date < new Date()) {
      throw new BadRequestException(
        'Cannot cancel registration for past events',
      );
    }

    await this.registrationRepository.remove(registration);

    return {
      message: 'Registration successfully cancelled',
    };
  }

  async findAll() {
    const libraryEvents = await this.libraryEventsRepository.find();
    if (!libraryEvents) {
      throw new NotFoundException('Não foi encontrado nenhum evento');
    }
    return libraryEvents;
  }

  async findOne(id: number) {
    const libraryEvent = await this.libraryEventsRepository.findOneBy({ id });
    if (!libraryEvent) {
      throw new NotFoundException('Evento nao encontrado');
    }
    return libraryEvent;
  }

  async update(id: number, updateLibraryEventDto: UpdateLibraryEventDto) {
    const libraryEvent = await this.findOne(id);
    if (!libraryEvent) {
      throw new NotFoundException('libraryEvent not found');
    }

    libraryEvent.title = updateLibraryEventDto?.title ?? libraryEvent.title;
    libraryEvent.location =
      updateLibraryEventDto?.location ?? libraryEvent.location;
    libraryEvent.banner = updateLibraryEventDto?.banner ?? libraryEvent.banner;
    libraryEvent.seats = updateLibraryEventDto?.seats ?? libraryEvent.seats;
    libraryEvent.description =
      updateLibraryEventDto?.description ?? libraryEvent.description;

    await this.libraryEventsRepository.save(libraryEvent);

    return libraryEvent;
  }

  async remove(id: number) {
    const libraryEvent = await this.findOne(id);
    if (!libraryEvent) {
      throw new NotFoundException('LibraryEvent not found');
    }
    return this.libraryEventsRepository.remove(libraryEvent);
  }
}

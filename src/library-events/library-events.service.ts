import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateLibraryEventDto } from './dto/create-library-event.dto';
import { UpdateLibraryEventDto } from './dto/update-library-event.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { LibraryEvent } from './entities/library-event.entity';
import { LibraryEventRegistration } from './entities/library-event-registrations.entity';
import { User } from 'src/users/entities/user.entity';
import { RegisterEventDto } from './dto/register-event.dto';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';
import { RoutePolicies } from 'src/auth/enum/route-policies.enum';
import * as path from 'path';
import * as fs from 'fs/promises';
import { create } from 'domain';

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

  async registerForEvent(
    eventId: number,
    registerDto: RegisterEventDto,
    tokenPayload: TokenPayloadDto,
  ) {
    if (registerDto.userId !== tokenPayload.sub) {
      throw new ForbiddenException(
        'You are not authorized to register for this event',
      );
    }
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

    const user = await this.userRepository.findOne({
      where: { id: registerDto.userId },
      relations: ['events'],
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
        username: reg.user.name,
        email: reg.user.email,
        registeredAt: reg.registeredAt,
        attended: reg.attended,
      })),
    };
  }

  async cancelRegistration(
    eventId: number,
    userId: number,
    tokenPayload: TokenPayloadDto,
  ) {
    const applicantPermissions = await this.userRepository.findOne({
      where: { id: tokenPayload.sub },
      select: ['id', 'permissions'],
    });

    if (
      userId !== tokenPayload.sub &&
      !applicantPermissions.permissions.includes(RoutePolicies.admin) &&
      !applicantPermissions.permissions.includes(RoutePolicies.librarian) &&
      !applicantPermissions.permissions.includes(RoutePolicies.socialMedia)
    ) {
      throw new ForbiddenException('You are not the owner of this loan');
    }

    const registration = await this.registrationRepository.findOne({
      where: {
        event: { id: eventId },
        user: { id: userId },
      },
      relations: ['event', 'user'],
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
      eventId: eventId,
      userId: userId,
    };
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [events, total] = await this.libraryEventsRepository.findAndCount({
      order: {
        id: 'DESC',
      },
      relations: ['registrations'],
      skip,
      take: limit,
    });

    const mappedEvents = events.map((event) => ({
      id: event.id,
      title: event.title,
      location: event.location,
      availableSeats: event.seats - event.registrations.length,
      banner: event.banner,
      registrations: event.registrations.length,
      date: event.date,
      seats: event.seats,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    }));

    return {
      data: mappedEvents,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const libraryEvent = await this.libraryEventsRepository.findOne({
      where: { id },
      relations: ['registrations'],
    });

    if (!libraryEvent) {
      throw new NotFoundException('Evento nao encontrado');
    }

    return {
      id: libraryEvent.id,
      title: libraryEvent.title,
      description: libraryEvent.description,
      location: libraryEvent.location,
      availableSeats: libraryEvent.seats - libraryEvent.registrations.length,
      banner: libraryEvent.banner,
      registrations: libraryEvent.registrations.length,
      date: libraryEvent.date,
      seats: libraryEvent.seats,
    };
  }

  async getUserEvents(userId: number, tokenPayload: TokenPayloadDto) {
    const applicantPermissions = await this.userRepository.findOne({
      where: { id: tokenPayload.sub },
      select: ['id', 'permissions'],
    });

    if (
      userId !== tokenPayload.sub &&
      !applicantPermissions.permissions.includes(RoutePolicies.admin) &&
      !applicantPermissions.permissions.includes(RoutePolicies.librarian) &&
      !applicantPermissions.permissions.includes(RoutePolicies.socialMedia)
    ) {
      throw new ForbiddenException('You are not the owner of this loan');
    }

    const registrations = await this.registrationRepository.find({
      where: {
        user: { id: userId },
      },
      relations: ['event', 'user'],
      order: {
        registeredAt: 'DESC',
      },
    });

    if (!registrations.length) {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      return {
        userId: user.id,
        username: user.name,
        totalRegistrations: 0,
        events: [],
      };
    }

    const userEvents = registrations.map((registration) => ({
      registrationId: registration.id,
      event: {
        id: registration.event.id,
        title: registration.event.title,
        description: registration.event.description,
        banner: registration.event.banner,
        date: registration.event.date,
        location: registration.event.location,
        seats: registration.event.seats,
      },
      registeredAt: registration.registeredAt,
      attended: registration.attended,
    }));

    return {
      userId: registrations[0].user.id,
      userName: registrations[0].user.name,
      totalRegistrations: userEvents.length,
      events: userEvents,
    };
  }

  async update(id: number, updateLibraryEventDto: UpdateLibraryEventDto) {
    const libraryEvent = await this.libraryEventsRepository.findOne({
      where: { id: id },
    });
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
    const libraryEvent = await this.libraryEventsRepository.findOne({
      where: { id: id },
    });
    if (!libraryEvent) {
      throw new NotFoundException('LibraryEvent not found');
    }
    return this.libraryEventsRepository.remove(libraryEvent);
  }

  async getEventByTitle(title: string) {
    const libraryEvent = await this.libraryEventsRepository.find({
      where: {
        title: ILike(`%${title}%`),
      },
      relations: ['registrations', 'registrations.user'],
      order: {
        title: 'ASC',
      },
      take: 10,
    });

    if (!libraryEvent || libraryEvent.length === 0) {
      throw new NotFoundException('LibraryEvent not found');
    }

    return libraryEvent.map((event) => ({
      ...event,
      registrations: event.registrations.map((registration) => ({
        id: registration.id,
        attended: registration.attended,
        registeredAt: registration.registeredAt,
        user: {
          id: registration.user.id,
          name: registration.user.name,
          email: registration.user.email,
        },
      })),
    }));
  }

  async attendEvent(eventId: number, userId: number) {
    const registration = await this.registrationRepository.findOne({
      where: {
        user: { id: userId },
        event: { id: eventId },
      },
    });
    if (!registration) {
      throw new NotFoundException('Registration not found');
    }
    registration.attended = !registration.attended;
    await this.registrationRepository.save(registration);
    return registration;
  }

  async uploadBanner(file: Express.Multer.File, id: number) {
    const event = await this.libraryEventsRepository.findOneBy({
      id: id,
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (file.size < 1024) {
      throw new BadRequestException('File too small');
    }

    const fileExtension = path
      .extname(file.originalname)
      .toLowerCase()
      .substring(1);

    const fileName = `event-${id}.${fileExtension}`;
    const fileFullPath = path.resolve(process.cwd(), 'pictures', fileName);

    // talvez fazer a validacao do tipo do arquivo

    await fs.writeFile(fileFullPath, file.buffer);

    event.banner = fileName;

    await this.libraryEventsRepository.save(event);
    return event;
  }
}

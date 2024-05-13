import { Location, Schedule, Picture } from "@prisma/client";

export interface EventFormData {
    eventId: number;
    locations: Location[];
    schedules: Schedule[];
    pictures: Picture[];
}
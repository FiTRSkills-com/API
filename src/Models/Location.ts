import { Schema, Decimal128 } from "mongoose";

/**
 * @typedef {Object} Skill
 * @property {string} Skill The name of the skill.
 * @property {Date} Date The date the skill was added.
 * @example { Skill: "JavaScript", Date: "2020-01-01T00:00:00.000Z" }
 */
export interface Location {
  city: string;
  state: string;
  address: string;
  zipCode: string;
  geoCoordinates: Coordinate;
}

interface Coordinate {
  latitude: Decimal128;
  longitude: Decimal128;
}

const CoordinateSchema: Schema = new Schema<Coordinate>({
  latitude: {
    type: Schema.Types.Decimal128,
    required: true,
  },
  longitude: {
    type: Schema.Types.Decimal128,
    required: true,
  },
});

export const LocationSchema: Schema = new Schema<Location>({
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  zipCode: {
    type: String,
    required: true,
  },
  geoCoordinates: {
    type: CoordinateSchema,
    required: true,
  },
});

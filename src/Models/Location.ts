import { Schema } from "mongoose";

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
  latitude: Number;
  longitude: Number;
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
    required: false,
  },
  state: {
    type: String,
    required: false,
  },
  address: {
    type: String,
    required: false,
  },
  zipCode: {
    type: String,
    required: false,
  },
  geoCoordinates: {
    type: CoordinateSchema,
    required: false,
    _id: false,
  },
});

const defaultCoordinates: Coordinate = {
  longitude: 0.0,
  latitude: 0.0,
};

export const defaultLocation: Location = {
  city: "",
  state: "",
  address: "",
  zipCode: "",
  geoCoordinates: defaultCoordinates,
};

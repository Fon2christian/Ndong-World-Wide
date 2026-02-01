import mongoose from "mongoose";

/**
 * Validate MongoDB ObjectId format
 */
export function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

/**
 * Valid display location values for filtering
 */
export const validDisplayLocations = ["market", "business", "both"] as const;

export type DisplayLocation = typeof validDisplayLocations[number];

/**
 * Valid contact status values
 */
export const validContactStatuses = ["new", "in_progress", "resolved"] as const;

export type ContactStatus = typeof validContactStatuses[number];

/**
 * Valid tire condition values
 */
export const validTireConditions = ["new", "used"] as const;

export type TireCondition = typeof validTireConditions[number];

import { api } from "./api";

export type TripDetails = {
  id: string;
  destination: string;
  starts_at: string;
  ends_at: string;
  is_confirmed: boolean;
};

export type TripCreate = Omit<TripDetails, "id" | "is_confirmed"> & {
  emails_to_invite: string[];
};

async function getById(id: string) {
  try {
    const { data } = await api.get<{ trip: TripDetails }>(`/trips/${id}`);
    return data.trip;
  } catch (error) {
    throw error;
  }
}

async function create({ ...rest }: TripCreate) {
  try {
    const { data } = await api.post<{ tripId: string }>("/trips", {
      owner_name: "Halyson",
      owner_email: "test@test.com",
      ...rest,
    });

    return data;
  } catch (error) {
    throw error;
  }
}

async function update({ id, ...rest }: Omit<TripDetails, "is_confirmed">) {
  try {
    const { data } = await api.put<{ tripId: string }>(`/trips/${id}`, {
      ...rest,
    });

    return data;
  } catch (error) {
    throw error;
  }
}

export const tripServer = { getById, create, update };

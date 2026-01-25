import { supabase } from '../lib/supabase';
import type { Tables, Insertable, Updatable } from '../types/database';

export type Pet = Tables<'pets'>;
export type PetAllergy = Tables<'pet_allergies'>;
export type VaccinationRecord = Tables<'vaccination_records'>;

// Extended pet type with relations
export interface PetWithDetails extends Pet {
  allergies: PetAllergy[];
  vaccinations: VaccinationRecord[];
}

// ============================================
// Pet CRUD Operations
// ============================================

/**
 * Get all pets for a family
 */
export const getPetsByFamily = async (familyId: string): Promise<PetWithDetails[]> => {
  const { data: pets, error } = await supabase
    .from('pets')
    .select(`
      *,
      allergies:pet_allergies(*),
      vaccinations:vaccination_records(*)
    `)
    .eq('family_id', familyId)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return pets as PetWithDetails[];
};

/**
 * Get a single pet by ID
 */
export const getPetById = async (petId: string): Promise<PetWithDetails | null> => {
  const { data: pet, error } = await supabase
    .from('pets')
    .select(`
      *,
      allergies:pet_allergies(*),
      vaccinations:vaccination_records(*)
    `)
    .eq('id', petId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw error;
  }

  return pet as PetWithDetails;
};

/**
 * Create a new pet
 */
export const createPet = async (
  pet: Omit<Insertable<'pets'>, 'id' | 'created_at' | 'updated_at'>,
  allergies?: string[],
  vaccinations?: Omit<Insertable<'vaccination_records'>, 'id' | 'pet_id' | 'created_at'>[]
): Promise<PetWithDetails> => {
  // Create pet
  const { data: newPet, error: petError } = await supabase
    .from('pets')
    .insert(pet)
    .select()
    .single();

  if (petError) {
    throw petError;
  }

  // Add allergies if provided
  if (allergies && allergies.length > 0) {
    const allergyRecords = allergies.map(name => ({
      pet_id: newPet.id,
      allergy_name: name,
    }));

    await supabase.from('pet_allergies').insert(allergyRecords);
  }

  // Add vaccinations if provided
  if (vaccinations && vaccinations.length > 0) {
    const vaccinationRecords = vaccinations.map(v => ({
      ...v,
      pet_id: newPet.id,
    }));

    await supabase.from('vaccination_records').insert(vaccinationRecords);
  }

  // Return full pet with relations
  return getPetById(newPet.id) as Promise<PetWithDetails>;
};

/**
 * Update a pet
 */
export const updatePet = async (
  petId: string,
  updates: Updatable<'pets'>
): Promise<Pet> => {
  const { data, error } = await supabase
    .from('pets')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', petId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

/**
 * Delete a pet
 */
export const deletePet = async (petId: string): Promise<void> => {
  // Related records (allergies, vaccinations, logs) will be deleted by CASCADE
  const { error } = await supabase
    .from('pets')
    .delete()
    .eq('id', petId);

  if (error) {
    throw error;
  }
};

// ============================================
// Allergies Management
// ============================================

/**
 * Add allergy to a pet
 */
export const addAllergy = async (
  petId: string,
  allergyName: string,
  severity?: 'mild' | 'moderate' | 'severe',
  notes?: string
): Promise<PetAllergy> => {
  const { data, error } = await supabase
    .from('pet_allergies')
    .insert({
      pet_id: petId,
      allergy_name: allergyName,
      severity,
      notes,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

/**
 * Remove allergy from a pet
 */
export const removeAllergy = async (allergyId: string): Promise<void> => {
  const { error } = await supabase
    .from('pet_allergies')
    .delete()
    .eq('id', allergyId);

  if (error) {
    throw error;
  }
};

/**
 * Get allergies for a pet
 */
export const getAllergies = async (petId: string): Promise<PetAllergy[]> => {
  const { data, error } = await supabase
    .from('pet_allergies')
    .select('*')
    .eq('pet_id', petId)
    .order('allergy_name');

  if (error) {
    throw error;
  }

  return data;
};

// ============================================
// Vaccination Records Management
// ============================================

/**
 * Add vaccination record
 */
export const addVaccination = async (
  vaccination: Omit<Insertable<'vaccination_records'>, 'id' | 'created_at'>
): Promise<VaccinationRecord> => {
  const { data, error } = await supabase
    .from('vaccination_records')
    .insert(vaccination)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

/**
 * Update vaccination record
 */
export const updateVaccination = async (
  vaccinationId: string,
  updates: Updatable<'vaccination_records'>
): Promise<VaccinationRecord> => {
  const { data, error } = await supabase
    .from('vaccination_records')
    .update(updates)
    .eq('id', vaccinationId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

/**
 * Delete vaccination record
 */
export const deleteVaccination = async (vaccinationId: string): Promise<void> => {
  const { error } = await supabase
    .from('vaccination_records')
    .delete()
    .eq('id', vaccinationId);

  if (error) {
    throw error;
  }
};

/**
 * Get vaccination records for a pet
 */
export const getVaccinations = async (petId: string): Promise<VaccinationRecord[]> => {
  const { data, error } = await supabase
    .from('vaccination_records')
    .select('*')
    .eq('pet_id', petId)
    .order('date', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
};

/**
 * Get upcoming vaccinations (due within X days)
 */
export const getUpcomingVaccinations = async (
  familyId: string,
  daysAhead: number = 30
): Promise<(VaccinationRecord & { pet: Pick<Pet, 'id' | 'name'> })[]> => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  const { data, error } = await supabase
    .from('vaccination_records')
    .select(`
      *,
      pet:pets!inner(id, name, family_id)
    `)
    .not('next_due_date', 'is', null)
    .lte('next_due_date', futureDate.toISOString().split('T')[0])
    .gte('next_due_date', new Date().toISOString().split('T')[0])
    .order('next_due_date');

  if (error) {
    throw error;
  }

  // Filter by family_id (since we can't directly filter on joined table)
  return (data as any[]).filter(v => v.pet?.family_id === familyId);
};

import { supabase } from '../lib/supabase';
import type { Tables, Insertable, Updatable } from '../types/database';

export type FamilyTodo = Tables<'family_todos'>;
export type FamilyNote = Tables<'family_notes'>;

// Extended types with pet info
export interface TodoWithPet extends FamilyTodo {
  pet?: { id: string; name: string } | null;
}

export interface NoteWithPet extends FamilyNote {
  pet?: { id: string; name: string } | null;
}

// ============================================
// Family Todos
// ============================================

/**
 * Get all todos for a family
 */
export const getTodos = async (
  familyId: string,
  includeCompleted: boolean = true
): Promise<TodoWithPet[]> => {
  let query = supabase
    .from('family_todos')
    .select(`
      *,
      pet:pets(id, name)
    `)
    .eq('family_id', familyId)
    .order('created_at', { ascending: false });

  if (!includeCompleted) {
    query = query.eq('is_completed', false);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as TodoWithPet[];
};

/**
 * Get todos for a specific pet
 */
export const getTodosByPet = async (
  petId: string,
  includeCompleted: boolean = true
): Promise<FamilyTodo[]> => {
  let query = supabase
    .from('family_todos')
    .select('*')
    .eq('pet_id', petId)
    .order('created_at', { ascending: false });

  if (!includeCompleted) {
    query = query.eq('is_completed', false);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
};

/**
 * Create a todo
 */
export const createTodo = async (
  todo: Omit<Insertable<'family_todos'>, 'id' | 'created_at'>
): Promise<FamilyTodo> => {
  const { data, error } = await supabase
    .from('family_todos')
    .insert(todo)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update a todo
 */
export const updateTodo = async (
  todoId: string,
  updates: Updatable<'family_todos'>
): Promise<FamilyTodo> => {
  const { data, error } = await supabase
    .from('family_todos')
    .update(updates)
    .eq('id', todoId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Toggle todo completion
 */
export const toggleTodoCompletion = async (
  todoId: string,
  completedBy: string | null
): Promise<FamilyTodo> => {
  // First get current state
  const { data: current, error: fetchError } = await supabase
    .from('family_todos')
    .select('is_completed')
    .eq('id', todoId)
    .single();

  if (fetchError) throw fetchError;

  const newCompletedState = !current.is_completed;

  const { data, error } = await supabase
    .from('family_todos')
    .update({
      is_completed: newCompletedState,
      completed_by: newCompletedState ? completedBy : null,
      completed_at: newCompletedState ? new Date().toISOString() : null,
    })
    .eq('id', todoId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Delete a todo
 */
export const deleteTodo = async (todoId: string): Promise<void> => {
  const { error } = await supabase
    .from('family_todos')
    .delete()
    .eq('id', todoId);

  if (error) throw error;
};

/**
 * Get overdue todos
 */
export const getOverdueTodos = async (
  familyId: string
): Promise<FamilyTodo[]> => {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('family_todos')
    .select('*')
    .eq('family_id', familyId)
    .eq('is_completed', false)
    .not('due_date', 'is', null)
    .lt('due_date', today)
    .order('due_date', { ascending: true });

  if (error) throw error;
  return data;
};

// ============================================
// Family Notes
// ============================================

/**
 * Get all notes for a family
 */
export const getNotes = async (
  familyId: string,
  pinnedOnly: boolean = false
): Promise<NoteWithPet[]> => {
  let query = supabase
    .from('family_notes')
    .select(`
      *,
      pet:pets(id, name)
    `)
    .eq('family_id', familyId)
    .order('is_pinned', { ascending: false })
    .order('updated_at', { ascending: false });

  if (pinnedOnly) {
    query = query.eq('is_pinned', true);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as NoteWithPet[];
};

/**
 * Get notes for a specific pet
 */
export const getNotesByPet = async (petId: string): Promise<FamilyNote[]> => {
  const { data, error } = await supabase
    .from('family_notes')
    .select('*')
    .eq('pet_id', petId)
    .order('is_pinned', { ascending: false })
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data;
};

/**
 * Get a single note by ID
 */
export const getNoteById = async (
  noteId: string
): Promise<NoteWithPet | null> => {
  const { data, error } = await supabase
    .from('family_notes')
    .select(`
      *,
      pet:pets(id, name)
    `)
    .eq('id', noteId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data as NoteWithPet;
};

/**
 * Create a note
 */
export const createNote = async (
  note: Omit<Insertable<'family_notes'>, 'id' | 'created_at' | 'updated_at'>
): Promise<FamilyNote> => {
  const { data, error } = await supabase
    .from('family_notes')
    .insert(note)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update a note
 */
export const updateNote = async (
  noteId: string,
  updates: Updatable<'family_notes'>
): Promise<FamilyNote> => {
  const { data, error } = await supabase
    .from('family_notes')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', noteId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Toggle note pin status
 */
export const toggleNotePin = async (noteId: string): Promise<FamilyNote> => {
  // First get current state
  const { data: current, error: fetchError } = await supabase
    .from('family_notes')
    .select('is_pinned')
    .eq('id', noteId)
    .single();

  if (fetchError) throw fetchError;

  const { data, error } = await supabase
    .from('family_notes')
    .update({
      is_pinned: !current.is_pinned,
      updated_at: new Date().toISOString(),
    })
    .eq('id', noteId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Delete a note
 */
export const deleteNote = async (noteId: string): Promise<void> => {
  const { error } = await supabase
    .from('family_notes')
    .delete()
    .eq('id', noteId);

  if (error) throw error;
};

// ============================================
// Note Colors (same as original)
// ============================================

export const noteColors = [
  { id: 'yellow', color: '#fef3c7', label: '노랑' },
  { id: 'pink', color: '#fce7f3', label: '분홍' },
  { id: 'blue', color: '#dbeafe', label: '파랑' },
  { id: 'green', color: '#d1fae5', label: '초록' },
  { id: 'purple', color: '#ede9fe', label: '보라' },
  { id: 'orange', color: '#ffedd5', label: '주황' },
];

export const defaultNoteColor = '#fef3c7'; // 노랑

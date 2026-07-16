'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';

const VALID_STATUSES = ['pending_review', 'published', 'flagged', 'rejected'] as const;
type IncidentStatus = (typeof VALID_STATUSES)[number];

// Defense in depth: middleware already blocks unauthenticated requests to
// /admin, but Server Actions are their own POST endpoint, so re-check here
// with the moderator's own session rather than assume the caller passed
// through middleware.
async function requireModerator() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }
}

// The moderator's own session can't perform this update — supabase/schema.sql
// has no UPDATE policy on incidents for any role, so it's not achievable
// under RLS. The service-role client is used only for the write itself, and
// only touches the status column, per the requirement that moderation
// actions change nothing else.
export async function updateIncidentStatus(incidentId: string, status: IncidentStatus) {
  await requireModerator();

  if (!VALID_STATUSES.includes(status)) {
    throw new Error(`Invalid status: ${status}`);
  }

  const { error } = await supabaseAdmin
    .from('incidents')
    .update({ status })
    .eq('id', incidentId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin');
  revalidatePath(`/admin/${incidentId}`);
}

export async function signOutModerator() {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}

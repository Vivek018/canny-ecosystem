// import { TypedSupabaseClient } from "../types";

// export const getStatutoryBonusById = async ({
//   supabase,
//   id,
// }: {
//   supabase: TypedSupabaseClient;
//   id: string;
// }) => {

//     const columns = [
//       "id",
//       "employee_id",
//       "statutory_type",
//       "amount",
//     ] as const;

//     const query = supabase
//     .from("employees")
//     .select(
//       `${columns.join(",")},
//       employee_project_assignment!employee_project_assignments_employee_id_fkey!inner(
//         employee_id, assignment_type, skill_level, position, start_date, end_date,
//         project_sites!inner(id, name, projects!inner(id, name))
//       )`,
//       { count: "exact" }
//     )
//     .eq("id", id);

//     // if (error) {
//     //   console.error(error);
//     // }

//     // return { data, error };
// };

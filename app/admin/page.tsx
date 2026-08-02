import { getCurrentAdmin } from '@/lib/session';
import { getAllEntries } from '@/lib/db';
import { CATEGORY_TAGS, isCategory, type Category } from '@/lib/categories';
import LoginForm from '@/components/admin/LoginForm';
import AdminDashboard, { type AdminFilter } from '@/components/admin/AdminDashboard';

export default async function AdminPage(props: PageProps<'/admin'>) {
  const user = await getCurrentAdmin();
  if (!user) return <LoginForm />;

  const searchParams = await props.searchParams;

  const sortParam = searchParams.sort;
  const sort: AdminFilter['sort'] =
    sortParam === 'edited' || sortParam === 'release' ? sortParam : 'created';
  const order: AdminFilter['order'] = searchParams.order === 'asc' ? 'asc' : 'desc';

  const categoryParam = searchParams.category;
  const category = isCategory(typeof categoryParam === 'string' ? categoryParam : undefined)
    ? (categoryParam as Category)
    : undefined;

  const tag = typeof searchParams.tag === 'string' ? searchParams.tag : undefined;

  const statusParam = searchParams.status;
  const status: AdminFilter['status'] =
    statusParam === 'public' ? 'public' : statusParam === 'private' ? 'private' : undefined;

  const filter: AdminFilter = { sort, order, category, tag, status };

  const entries = getAllEntries({
    category,
    tag,
    sort,
    order,
    published: status === 'public' ? true : status === 'private' ? false : undefined,
  });

  const allEntries = getAllEntries();
  const tagOptions = category
    ? CATEGORY_TAGS[category]
    : [...new Set(allEntries.flatMap((e) => e.tags))].sort();

  return <AdminDashboard user={user} entries={entries} tagOptions={tagOptions} filter={filter} />;
}

import { UserListPageContent } from '@/components/user/UserListPageContent';

interface PageProps {
    params: Promise<{ listId: string }>;
}

export default async function CustomListPage({ params }: PageProps) {
    const { listId } = await params;
    return <UserListPageContent listId={listId} />;
}

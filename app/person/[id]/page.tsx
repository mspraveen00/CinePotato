import { notFound } from 'next/navigation';
import { getPersonDetail } from '@/lib/services/person-service';
import PersonProfileHeader from '@/components/person/PersonProfileHeader';

export const revalidate = 3600; // Cache for 1 hour

export default async function PersonPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;

    const person = await getPersonDetail(id);

    if (!person) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-black text-white pb-24 overflow-x-hidden pt-8 md:pt-14">
            <div className="container mx-auto px-4 max-w-7xl">
                <PersonProfileHeader person={person} />
            </div>
        </div>
    );
}

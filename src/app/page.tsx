import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { firestore } from '../utils/firebaseConfig';
import IdeaList from '../components/IdeaList';
import { Idea } from '../types/idea';

export default async function Home() {
  const ideasQuery = query(collection(firestore, 'ideas'), orderBy('timestamp', 'desc'));
  const querySnapshot = await getDocs(ideasQuery);
  const ideas = querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      headline: data.headline,
      description: data.description,
      tags: data.tags,
      authorId: data.authorId,
      authorProfilePictureUrl: data.authorProfilePictureUrl || '',
      timestamp: data.timestamp ? data.timestamp.toDate().toISOString() : new Date().toISOString(),
      likes: data.likes || 0,
      comments: data.comments || 0,
    }
  }) as Idea[];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Idea Feed</h1>
      <IdeaList initialIdeas={ideas} />
    </div>
  );
}

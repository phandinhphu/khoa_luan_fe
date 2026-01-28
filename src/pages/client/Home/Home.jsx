import { useNavigate } from "react-router-dom";
import { useAllDocuments } from '@/hooks/useDocument';
import DocumentCard from "@/components/document/DocumentCard";

const Home = () => {
    const { data: reponse, isLoading, isFetching } = useAllDocuments();
    const navigate = useNavigate();
    
    const documents = reponse?.data?.documents || [];

    if (isLoading) {
        return <div>Loading documents...</div>;
    }

    if (isFetching) {
        return <div>Updating documents...</div>;
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {documents.map(doc => (
                <DocumentCard
                    key={doc._id}
                    document={doc}
                    onClick={() => navigate(`/documents/${doc._id}`)}
                />
            ))}
        </div>

    );
};

export default Home;

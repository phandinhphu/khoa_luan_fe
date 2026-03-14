import { useEffect, useState, useRef } from "react";
import { previewDocument } from "../../services/document.service";
import { xorDecode } from "../../utils/function";
import { BookOpen, Eye } from 'lucide-react';
import './DocumentCard.css';

const DocumentCard = ({ document, onClick }) => {
    const canvasRef = useRef(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!document?._id) return;

        let cancelled = false;

        const loadPreview = async () => {
            try {
                const arrayBuffer = await previewDocument(document._id);

                if (cancelled) return;

                // Nếu có XOR decode thì giải mã ở đây
                const uint8Array = new Uint8Array(arrayBuffer);
                const decodedArray = xorDecode(uint8Array, 23);

                // Không set type để tránh trình duyệt tự động giải mã
                const blob = new Blob([new Uint8Array(decodedArray)]);
                const img = new Image();

                img.src = URL.createObjectURL(blob);

                img.onload = () => {
                    const canvas = canvasRef.current;
                    if (!canvas) return;

                    const ctx = canvas.getContext("2d");
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);

                    URL.revokeObjectURL(img.src);
                };
            } catch (err) {
                console.error("Không load được preview", err);
            } finally {
                setLoading(false);
            }
        };

        loadPreview();

        return () => {
            cancelled = true;
        };
    }, [document._id]);

    return (
        <article onClick={onClick} className="doc-card group cursor-pointer">
            <div className="doc-card-preview">
                {loading ? (
                    <div className="doc-card-loading">Dang tai preview...</div>
                ) : (
                    <canvas
                        ref={canvasRef}
                        draggable={false}
                        className="doc-card-canvas select-none pointer-events-none"
                    />
                )}

                <div className="doc-card-overlay">
                    <span>
                        <Eye size={14} />
                        Xem chi tiet
                    </span>
                </div>
            </div>

            <div className="doc-card-content">
                <h3 title={document.title}>{document.title}</h3>

                <div className="doc-card-meta">
                    <span>
                        <BookOpen size={14} />
                        Luot muon: {document.total_borrows || 0}
                    </span>
                    <span className="doc-card-badge">{document.copyright_status || 'Chua ro'}</span>
                </div>
            </div>
        </article>
    );
};

export default DocumentCard;

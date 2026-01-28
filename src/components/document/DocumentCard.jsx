import { useEffect, useState, useRef } from "react";
import { previewDocument } from "../../services/document.service";
import { xorDecode } from "../../utils/function";

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
        <div
            onClick={onClick}
            className="
                group
                w-48
                cursor-pointer
                overflow-hidden
                rounded-xl
                border
                border-gray-200
                bg-white
                shadow-sm
                transition
                hover:shadow-md
                hover:-translate-y-1
            "
        >
            {/* Preview */}
            <div className="relative h-64 overflow-hidden bg-gray-100">
                {loading ? (
                    <div className="text-sm text-gray-400">Loading...</div>
                ) : (
                    <canvas
                        ref={canvasRef}
                        alt={document.title}
                        draggable={false}
                        className="
                            h-full w-full object-cover
                            transition-transform duration-300 ease-out
                            group-hover:scale-110
                            group-hover:-translate-y-4
                            select-none pointer-events-none
                        "
                    />
                )}
            </div>

            {/* Title */}
            <div className="p-3">
                <h3
                    className="
                        text-sm
                        font-medium
                        text-gray-800
                        truncate
                    "
                    title={document.title}
                >
                    {document.title}
                </h3>
            </div>
        </div>
    );
};

export default DocumentCard;

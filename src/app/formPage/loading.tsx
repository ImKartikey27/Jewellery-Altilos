export default function LoadingFormPage() {
    return (
        <div className="grid min-h-screen place-items-center bg-black text-white">
            <div className="rounded-lg border border-[#6f4b38]/80 bg-black/85 px-8 py-6 text-center shadow-2xl">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#6f4b38] border-t-[#f97316]" />
                <p className="mt-4 font-inter text-sm uppercase tracking-[0.12em] text-[#d8c4b8]">
                    Loading form
                </p>
            </div>
        </div>
    );
}

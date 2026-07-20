import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getMobileBanner, updateMobileBanner, uploadMobileBanner } from "@/services/settingService";
import { UploadCloud, Link } from "lucide-react";

export const SettingsTab = () => {
    const [bannerUrl, setBannerUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        const fetchBanner = async () => {
            try {
                const data = await getMobileBanner();
                if (data.bannerUrl) {
                    setBannerUrl(data.bannerUrl);
                }
            } catch (error) {
                console.error("Failed to fetch banner URL");
            } finally {
                setIsFetching(false);
            }
        };
        fetchBanner();
    }, []);

    const handleSave = async () => {
        if (!bannerUrl) {
            toast.error("Please enter a valid Image URL");
            return;
        }

        setIsLoading(true);
        try {
            await updateMobileBanner(bannerUrl);
            toast.success("Mobile welcome banner updated successfully!");
        } catch (error) {
            toast.error("Failed to update banner URL");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const uploaded = await uploadMobileBanner(file);
            if (uploaded && uploaded.url) {
                const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
                const finalUrl = uploaded.url.startsWith("http") 
                    ? uploaded.url 
                    : `${baseUrl}${uploaded.url.startsWith('/') ? '' : '/'}${uploaded.url}`;
                
                setBannerUrl(finalUrl);
                toast.success("Image uploaded successfully. Don't forget to save!");
            }
        } catch (error) {
            toast.error("Failed to upload image");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
            <div>
                <h3 className="text-lg font-bold text-gray-900">Mobile Welcome Banner</h3>
                <p className="text-sm text-gray-500 mt-1">This banner appears in the mobile app when a user opens the chat for the first time.</p>
            </div>

            {isFetching ? (
                <div className="animate-pulse h-40 bg-gray-100 rounded-xl w-full"></div>
            ) : (
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label>Banner Image Source</Label>
                        
                        {/* Option 1: File Upload */}
                        <div className="flex items-center gap-4">
                            <label className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors relative">
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={handleFileUpload} 
                                    disabled={isUploading}
                                />
                                <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                                <span className="text-sm font-medium text-gray-600">
                                    {isUploading ? "Uploading..." : "Click to upload an image"}
                                </span>
                            </label>
                        </div>

                        {/* Option 2: URL Input */}
                        <div className="flex items-center gap-2 mt-4">
                            <span className="text-xs font-bold text-gray-400 uppercase">OR PASTE URL</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <Link className="w-5 h-5 text-gray-400" />
                            <Input
                                id="bannerUrl"
                                placeholder="https://example.com/image.jpg"
                                value={bannerUrl}
                                onChange={(e) => setBannerUrl(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Live Preview (16:9 Aspect Ratio)</Label>
                        <div className="w-full max-w-sm aspect-video border-2 border-dashed border-gray-200 rounded-xl overflow-hidden bg-gray-50 flex flex-col items-center justify-center text-gray-400">
                            {bannerUrl ? (
                                <img src={bannerUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-sm font-medium">No Banner Set</span>
                            )}
                        </div>
                    </div>

                    <Button onClick={handleSave} disabled={isLoading} className="w-full max-w-sm">
                        {isLoading ? "Saving..." : "Save Banner Configuration"}
                    </Button>
                </div>
            )}
        </div>
    );
};

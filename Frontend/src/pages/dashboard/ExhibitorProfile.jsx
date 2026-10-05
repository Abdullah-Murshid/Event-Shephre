import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import clsx from "clsx";

export default function ExhibitorProfile() {
    const [exhibitor, setExhibitor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [logoFile, setLogoFile] = useState(null);
    const [formData, setFormData] = useState({
        companyName: "",
        logo: "",
        description: "",
        contactInfo: "",
        products: ""
    });

    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        fetchExhibitor();
    }, []);

    const fetchExhibitor = async () => {
        try {
            const response = await axios.get("http://localhost:3000/exhibitor/getall");
            if (response.data.status) {
                const myExhibitor = response.data.data.find(e => e.userId?._id === user?._id || e.userId === user?._id);
                if (myExhibitor) {
                    setExhibitor(myExhibitor);
                    setFormData({
                        companyName: myExhibitor.companyName || "",
                        logo: myExhibitor.logo || "",
                        description: myExhibitor.description || "",
                        contactInfo: myExhibitor.contactInfo || "",
                        products: myExhibitor.products || ""
                    });
                }
            }
        } catch (error) {
            toast.error("Telemetry failure: Profile retrieval denied.");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setLogoFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const data = new FormData();
            data.append("companyName", formData.companyName);
            data.append("description", formData.description);
            data.append("contactInfo", formData.contactInfo);
            data.append("products", formData.products);
            if (logoFile) {
                data.append("logo", logoFile);
            }

            const response = await axios.put(`http://localhost:3000/exhibitor/update/${exhibitor._id}`, data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            if (response.data.status) {
                toast.success("Protocol updated: Identity profile synchronized.");
                setExhibitor(response.data.data);
                setFormData(prev => ({ ...prev, logo: response.data.data.logo }));
                setLogoFile(null);
            }
        } catch (error) {
            toast.error("Execution failure: Profile synchronization denied.");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64 grayscale opacity-20">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
    if (!exhibitor) return (
        <div className="p-24 text-center bg-surface-container-low border border-dashed border-outline-variant/30 rounded-[48px] opacity-40 grayscale flex flex-col items-center gap-stack-md shadow-inner">
            <span className="material-symbols-rounded text-[64px]">account_box</span>
            <p className="font-label-md font-semibold tracking-wide">Exhibitor profile not detected. Please verify your application status.</p>
        </div>
    );

    return (
        <div className="space-y-stack-xl pb-20">
            <header>
                <div className="flex items-center gap-stack-sm text-primary font-bold tracking-wide mb-stack-sm text-2xl md:text-3xl">
                    Identity Management
                </div>
                <h1 className="font-black text-4xl md:text-6xl text-on-surface tracking-tighter leading-none">Exhibitor Identity</h1>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
                <div className="lg:col-span-2">
                    <div className="bg-surface-container-low border border-outline-variant/30 rounded-[48px] p-12 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
                        
                        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                                <div className="space-y-unit">
                                    <label className="font-label-sm text-xs font-semibold text-on-surface-variant opacity-40 ml-4">COmpany Name</label>
                                    <div className="relative group">
                                        <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-40 group-focus-within:opacity-100 transition-opacity z-10">corporate_fare</span>
                                        <input
                                            name="companyName"
                                            value={formData.companyName}
                                            onChange={handleInputChange}
                                            className="w-full bg-surface-container-high border border-outline-variant/20 rounded-2xl py-4 pl-12 pr-6 text-on-surface font-body-md focus:outline-none focus:border-primary/50 transition-all shadow-inner"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-unit">
                                    <label className="font-label-sm text-xs font-semibold text-on-surface-variant opacity-40 ml-4">Logo</label>
                                    <div className="relative group">
                                        <input 
                                            type="file"
                                            onChange={handleFileChange} 
                                            accept="image/*"
                                            className="w-full bg-surface-container-high border border-outline-variant/20 rounded-2xl py-4 px-6 text-on-surface font-body-md focus:outline-none focus:border-primary/50 transition-all shadow-inner file:bg-primary/10 file:border-0 file:text-primary file:text-[10px] file:font-bold file:tracking-wide file:px-4 file:py-1 file:rounded-lg file:mr-4 hover:file:bg-primary/20 cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-unit">
                                <label className="font-label-sm text-xs font-semibold text-on-surface-variant opacity-40 ml-4">Contact</label>
                                <div className="relative group">
                                    <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-40 group-focus-within:opacity-100 transition-opacity z-10">contact_support</span>
                                    <input
                                        name="contactInfo"
                                        value={formData.contactInfo}
                                        onChange={handleInputChange}
                                        placeholder="Secure email or operative frequency"
                                        className="w-full bg-surface-container-high border border-outline-variant/20 rounded-2xl py-4 pl-12 pr-6 text-on-surface font-body-md focus:outline-none focus:border-primary/50 transition-all shadow-inner"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-unit">
                                <label className="font-label-sm text-xs font-semibold text-on-surface-variant opacity-40 ml-4">Products</label>
                                <div className="relative group">
                                    <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-40 group-focus-within:opacity-100 transition-opacity z-10">inventory_2</span>
                                    <input
                                        name="products"
                                        value={formData.products}
                                        onChange={handleInputChange}
                                        placeholder="What mission-critical assets are you providing?"
                                        className="w-full bg-surface-container-high border border-outline-variant/20 rounded-2xl py-4 pl-12 pr-6 text-on-surface font-body-md focus:outline-none focus:border-primary/50 transition-all shadow-inner"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-unit">
                                <label className="font-label-sm text-xs font-semibold text-on-surface-variant opacity-40 ml-4">Discreption</label>
                                <div className="relative">
                                    <textarea
                                        name="description"
                                        rows="5"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className="w-full bg-surface-container-high border border-outline-variant/20 rounded-3xl py-6 px-8 text-on-surface font-body-md focus:outline-none focus:border-primary/50 transition-all shadow-inner resize-none leading-relaxed"
                                        placeholder="Transmit organizational brief to the network..."
                                    ></textarea>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={updating}
                                className="w-full h-16 rounded-2xl bg-primary text-on-primary font-label-md text-label-md font-bold tracking-wide shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all flex items-center justify-center gap-stack-sm"
                            >
                                
                                {updating ? "Synchronizing..." : "Update Profile"}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="space-y-gutter">
                    <div className="bg-surface-container-low border border-outline-variant/30 rounded-[48px] p-10 text-center shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        
                        <div className="w-40 h-40 rounded-[48px] bg-surface-container-high border border-outline-variant/20 p-2 mx-auto mb-8 shadow-2xl relative">
                            <div className="w-full h-full rounded-[40px] bg-surface-container-lowest flex items-center justify-center overflow-hidden border border-outline-variant/10">
                                {formData.logo ? (
                                    <img 
                                        src={formData.logo.startsWith('http') ? formData.logo : `http://localhost:3000${formData.logo}`} 
                                        alt="Preview" 
                                        className="w-full h-full object-contain p-4" 
                                    />
                                ) : (
                                    <span className="text-primary font-display-md text-display-md tracking-tight opacity-20">{formData.companyName?.charAt(0) || "!"}</span>
                                )}
                            </div>
                        </div>
                        <h3 className="font-display-sm text-display-sm text-on-surface tracking-tighter truncate">{formData.companyName || "Sector Proxy"}</h3>
                        <p className="font-label-md text-label-md text-primary font-semibold mt-2 opacity-60 truncate">{formData.products || "Unassigned Asset"}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

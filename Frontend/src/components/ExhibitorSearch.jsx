import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import clsx from "clsx";

export default function ExhibitorSearch({ eventId, onContactExhibitor }) {
    const [exhibitors, setExhibitors] = useState([]);
    const [filteredExhibitors, setFilteredExhibitors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [showFilter, setShowFilter] = useState(false);
    const user = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("user") || "null");
        } catch (e) {
            return null;
        }
    }, []);

    useEffect(() => {
        fetchExhibitors();
    }, [eventId]);

    useEffect(() => {
        filterExhibitors();
    }, [exhibitors, searchQuery, selectedCategory]);

    const fetchExhibitors = async () => {
        try {
            const response = await axios.get(
                `http://localhost:3000/exhibitor/search?eventId=${eventId}&status=approved`
            );
            if (response.data.status) {
                setExhibitors(response.data.data);
                setFilteredExhibitors(response.data.data);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const filterExhibitors = () => {
        let filtered = exhibitors;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (ex) =>
                    ex.companyName?.toLowerCase().includes(query) ||
                    ex.products?.toLowerCase().includes(query) ||
                    ex.description?.toLowerCase().includes(query)
            );
        }
        if (selectedCategory) {
            filtered = filtered.filter((ex) =>
                ex.products?.toLowerCase().includes(selectedCategory.toLowerCase())
            );
        }
        if (user) {
            filtered = filtered.filter((ex) => (ex.userId?._id || ex.userId) !== user._id);
        }
        setFilteredExhibitors(filtered);
    };

    const categories = [
        "Technology", "Healthcare", "Education", "Finance", 
        "Manufacturing", "Retail", "Energy", "Transportation", 
        "Food & Beverage", "Entertainment",
    ];

    const handleContact = (exhibitor) => {
        if (!user) {
            toast.error("Protocol error: Authentication required.");
            return;
        }
        if (onContactExhibitor) {
            onContactExhibitor(exhibitor);
        }
    };

    return (
        <div className="space-y-stack-lg">
            {/* Command Bar */}
            <div className="flex flex-col sm:flex-row gap-stack-md">
                <div className="relative flex-grow group">
                    <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-[20px]">search</span>
                    <input
                        type="text"
                        placeholder="Scan company name, hardware, or keywords..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl py-stack-md pl-12 pr-stack-md text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary/50 transition-all placeholder:text-on-surface-variant/30 shadow-inner"
                    />
                </div>
                <button
                    onClick={() => setShowFilter(!showFilter)}
                    className={clsx(
                        "px-stack-xl py-stack-md rounded-2xl border font-label-md text-label-md font-semibold tracking-wide transition-all flex items-center gap-stack-sm shrink-0 shadow-lg active:scale-95",
                        showFilter
                            ? "bg-primary/20 border-primary/30 text-primary"
                            : "bg-surface-container-high border-outline-variant/30 text-on-surface-variant hover:border-primary/40"
                    )}
                >
                    <span className="material-symbols-rounded">filter_list</span>
                    Protocols
                </button>
            </div>

            {/* Strategy Filters */}
            <AnimatePresence>
                {showFilter && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="overflow-hidden"
                    >
                        <div className="flex flex-wrap gap-stack-sm p-stack-md bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-inner">
                            <button
                                onClick={() => setSelectedCategory("")}
                                className={clsx(
                                    "px-stack-lg py-1.5 rounded-full font-label-sm text-xs font-semibold transition-all border",
                                    !selectedCategory
                                        ? "bg-primary text-on-primary border-primary shadow-lg shadow-primary/20"
                                        : "bg-surface-container-high border-outline-variant/20 text-on-surface-variant hover:text-on-surface hover:border-outline-variant/40"
                                    )}
                            >
                                Universal
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={clsx(
                                        "px-stack-lg py-1.5 rounded-full font-label-sm text-xs font-semibold transition-all border",
                                        selectedCategory === cat
                                            ? "bg-primary text-on-primary border-primary shadow-lg shadow-primary/20"
                                            : "bg-surface-container-high border-outline-variant/20 text-on-surface-variant hover:text-on-surface hover:border-outline-variant/40"
                                    )}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Grid Metrics */}
            <div className="font-label-sm text-label-sm text-on-surface-variant opacity-60 flex items-center gap-stack-sm px-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Exhibitors: {filteredExhibitors.length} active
            </div>

            {/* Operative Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center h-48 gap-stack-md grayscale opacity-40">
                    <div className="w-8 h-8 border-2 border-on-surface-variant border-t-transparent rounded-full animate-spin" />
                    <p className="font-label-md text-label-md font-medium tracking-wide">Scanning Grid...</p>
                </div>
            ) : filteredExhibitors.length === 0 ? (
                <div className="p-16 text-center bg-surface-container-lowest border border-outline-variant/20 rounded-[40px] shadow-inner space-y-stack-md">
                    <span className="material-symbols-rounded text-[56px] text-on-surface-variant/20">search_off</span>
                    <div>
                        <h3 className="font-title-lg text-title-lg tracking-tight text-on-surface opacity-80">No Exhibitor for This Event</h3>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
                    {filteredExhibitors.map((exhibitor, index) => (
                        <motion.div
                            key={exhibitor._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="group"
                        >
                            <div className="h-full bg-surface-container-low border border-outline-variant/15 rounded-[32px] p-stack-xl hover:border-primary/40 transition-all hover:shadow-2xl hover:shadow-primary/5 flex flex-col">
                                <div className="flex items-start gap-stack-md mb-stack-lg">
                                    <div className="w-16 h-16 rounded-2xl bg-surface-container-high border border-outline-variant/20 p-2 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                                        {exhibitor.logo ? (
                                            <img
                                                src={exhibitor.logo.startsWith('http') ? exhibitor.logo : `http://localhost:3000${exhibitor.logo}`}
                                                alt={exhibitor.companyName}
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <span className="material-symbols-rounded text-on-surface-variant/30 text-[32px]">corporate_fare</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-title-md text-title-md tracking-tight text-on-surface truncate group-hover:text-primary transition-colors">
                                            {exhibitor.companyName}
                                        </h4>
                                        <p className="font-label-sm text-label-sm text-on-surface-variant opacity-60 truncate">
                                            {exhibitor.userId?.name || "Tactical Unit"}
                                        </p>
                                        {exhibitor.boothId && (
                                            <div className="inline-flex mt-unit px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary font-label-sm text-xs font-semibold">
                                                Booth Number {exhibitor.boothId.boothNumber}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <p className="font-body-sm text-body-sm text-on-surface-variant opacity-70 mb-stack-lg line-clamp-3 leading-relaxed">
                                    {exhibitor.description || exhibitor.products}
                                </p>

                                <div className="flex flex-wrap gap-unit mb-stack-xl mt-auto">
                                    {exhibitor.products?.split(",").slice(0, 3).map((product, i) => (
                                        <span
                                            key={i}
                                            className="font-label-sm text-[9px] font-semibold text-on-surface-variant/60 bg-surface-container-high px-2 py-1 rounded-lg border border-outline-variant/20"
                                        >
                                            {product.trim()}
                                        </span>
                                    ))}
                                </div>

                                <button
                                    onClick={() => handleContact(exhibitor)}
                                    className="w-full h-12 rounded-xl bg-surface-container-high border border-outline-variant/30 text-on-surface-variant font-label-md text-label-md font-medium tracking-wide hover:bg-primary hover:text-on-primary hover:border-primary transition-all flex items-center justify-center gap-stack-sm active:scale-95"
                                >               
                                    Contact Exhibitor
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
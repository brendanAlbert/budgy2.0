import { Receipts } from "../Receipts/Receipts";
import "./MainContent.css";
import { GrFormAdd } from "react-icons/gr";
import { BsReceipt } from "react-icons/bs";
import { IconContext } from "react-icons";
import { useState } from "react";
import { TableModal } from "../TableModal/TableModal";

export const MainContent = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    return (
        <div className="main-content">
            <div className="column-wrapper">
                <div className="left-column">
                    <h4
                        style={{
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        receipts
                        <span
                            className="add-receipt-button"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                // border: "2px solid #27ae60",
                                borderRadius: "25px",
                                padding: "6px 12px",
                                backgroundColor: "#1a1a1a",
                                marginLeft: "12px",
                                cursor: "pointer",
                            }}
                            onClick={() => setIsModalOpen((prev) => !prev)}
                        >
                            <IconContext.Provider
                                value={{
                                    size: "25px",
                                }}
                            >
                                <GrFormAdd />
                                <BsReceipt />
                            </IconContext.Provider>
                        </span>
                    </h4>
                    <Receipts />
                    {isModalOpen && (
                        <TableModal setIsModalOpen={setIsModalOpen} />
                    )}
                </div>
                <div className="right-column">
                    <h4>shopping data</h4>
                </div>
            </div>
        </div>
    );
};

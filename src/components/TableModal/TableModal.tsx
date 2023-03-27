import { useEffect, useState } from "react";
import "./TableModal.css";

interface IGrocery {
    item: string;
    cost: number;
}
const defaultReceipt: IGrocery[] = [
    { item: "Milk", cost: 5.99 },
    { item: "Eggs", cost: 8.99 },
    { item: "La Salsa Chilena", cost: 5.99 },
    { item: "Coffee", cost: 5.99 },
];
const defaultEditMode: number[][] = [
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
];

const itemIndex = 0;
const costIndex = 1;

export const TableModal = (props: any) => {
    const { setIsModalOpen } = props;
    const [receipt, setReceipt] = useState<IGrocery[]>(defaultReceipt);
    const [editMode, setEditMode] = useState<number[][]>(defaultEditMode);

    console.log({ editMode });

    const handleCloseModal = (e: any) => {
        if (["modal-bg"].includes(e.target["className"])) {
            setIsModalOpen(false);
        }
    };

    useEffect(() => {
        return () => {
            let empty = editMode.map((el) => [0, 0]);
            console.log({ empty });
            setEditMode(empty);
        };
    }, []);

    return (
        <div className="modal-bg" onClick={(e) => handleCloseModal(e)}>
            <div className="table-modal">
                <h5>upload new receipt modal</h5>
                <table className="mesa">
                    <tr className="tr-header">
                        <td>item</td>
                        <td>cost</td>
                    </tr>
                    {receipt.map((item, index) => (
                        <tr className="tr" key={index}>
                            <td
                                onClick={() => {
                                    let newEditState = [...editMode];
                                    newEditState[index][itemIndex] = 1;
                                    setEditMode(newEditState);
                                }}
                            >
                                {editMode[index][itemIndex] ? (
                                    <input
                                        type="text"
                                        value={receipt[index].item}
                                        onChange={(e) => {
                                            let value = e.target["value"];
                                            let newReceipt = receipt.map(
                                                (r, i) => {
                                                    if (!(index === i))
                                                        return r;
                                                    return {
                                                        ...r,
                                                        item: value,
                                                    };
                                                }
                                            );
                                            setReceipt(newReceipt);
                                        }}
                                    />
                                ) : (
                                    <td>{item.item}</td>
                                )}
                            </td>
                            <td>{item.cost}</td>
                        </tr>
                    ))}
                </table>
                <button className="upload-button">upload</button>
            </div>
            ;
        </div>
    );
};

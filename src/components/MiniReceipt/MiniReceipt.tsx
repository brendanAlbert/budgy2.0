import { useState } from "react";
import { IconContext } from "react-icons";
import { GrFormEdit } from "react-icons/gr";

export const MiniReceipt = (props: any) => {
    const { r, re, srcimg } = props;
    const mr = "icon-top-right";
    const [cn, setCN] = useState(mr);

    return (
        <div
            className={"mini-receipt"}
            onMouseEnter={() => setCN("icon-top-right icon-top-right-hover")}
            onMouseLeave={() => setCN(mr)}
        >
            <IconContext.Provider
                value={{
                    size: "25px",
                }}
            >
                <span className={cn}>
                    <GrFormEdit />
                </span>
            </IconContext.Provider>
            <div>{r.date}</div>
            <div className="no-lh">${r.amount}</div>
            <img className="mt-24" width="50" height="50" src={srcimg} />
        </div>
    );
};

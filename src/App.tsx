import { useState } from "react";
// import "./App.css";
import axios from "axios";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { MainContent } from "./components/MainContent/MainContent";

function App() {
    const [text, setText] = useState("");

    return (
        <>
            <Header />
            <Sidebar />
            <MainContent />
        </>
        // <div className="App">
        //     <h1>Budgy 2.0</h1>
        //     <h2>Vite + React</h2>
        //     <div className="card">
        //         {/* <button
        //             onClick={async () => {
        //                 const response = await fetch(
        //                     `http://localhost:7071/api/fetchOCR`
        //                 );

        //                 const data = await response.json();
        //                 console.log({ response, data });
        //                 setText(data?.body);
        //             }}
        //         >
        //             fetchOCR
        //         </button> */}
        //         <div>
        //             <input
        //                 type="file"
        //                 onChange={async (e) => {
        //                     const file = e.target.files?.[0];
        //                     console.log({ file });

        //                     const postImg = async () => {
        //                         // const response = await fetch(
        //                         //     // import.meta.env.VITE_API_FR_URL,
        //                         //     // "http://localhost:7071/api/fetchOCR",
        //                         //     "http://localhost:7071/api/saveBlob",
        //                         //     {
        //                         //         method: "POST",
        //                         //         body: file,
        //                         //     }
        //                         // );

        //                         const response = await axios({
        //                             method: "post",
        //                             url: "http://localhost:7071/api/saveBlob",
        //                             data: file,
        //                             headers: {
        //                                 "Content-Type": "multipart/form-data",
        //                                 // Authorization: "Ralphs",
        //                             },
        //                         });

        //                         // const fetchedData = await (
        //                         //     response as any
        //                         // ).json();

        //                         console.log({ response });
        //                     };

        //                     await postImg();
        //                 }}
        //             />
        //         </div>
        //         <p>
        //             <code>{text}</code>
        //         </p>
        //     </div>
        // </div>
    );
}

export default App;

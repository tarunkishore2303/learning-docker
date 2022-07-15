import React, { useState, useEffect } from "react";
import axios from "axios";

const renderValues = (state) => {
	let entries = [];
	for (let key in state) {
		entries.push(
			<div key={key}>
				For index {key} I Calculated {state[key]}
			</div>
		);
	}
	return entries;
};

const handleSubmit = async (event, index) => {
	event.preventDefault();

	await axios.post("/api/values", {
		index: index,
	});
};

export default function Fib() {
	const [seenIndex, setSeenIndex] = useState([]);
	const [values, setValues] = useState({});
	const [index, setIndex] = useState("");

	useEffect(() => {
		async function fetchValues() {
			let values = await axios.get("/api/values/current");
			setValues(values.data);
		}
		async function fetchIndex() {
			let seenIndex = await axios.get("/api/values/all");
			setSeenIndex(seenIndex);
		}

		fetchValues();
		fetchIndex();
	}, []);

	return (
		<div>
			<form
				onSubmit={() => {
					handleSubmit(index);
					setIndex("");
				}}
			>
				<label>Enter your index</label>
				<input
					value={index}
					onChange={(event) => setIndex(event.target.value)}
				/>
				<button>Submit</button>
			</form>
			<h3>Indexes I have seen</h3>
			{seenIndex.map(({ number }) => number).join(", ")}
			<h3>Calculated Indexs:</h3>
			{renderValues(values)}
		</div>
	);
}

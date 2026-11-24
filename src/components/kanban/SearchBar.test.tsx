import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import SearchBar from "./SearchBar";

describe("SearchBar", () => {
	afterEach(() => {
		cleanup();
	});

	it("updates query on input change and supports custom placeholder", () => {
		const onChange = vi.fn();
		render(
			<SearchBar
				value=""
				onChange={onChange}
				placeholder="Buscar tareas en Focus..."
			/>,
		);

		const input = screen.getByPlaceholderText("Buscar tareas en Focus...");
		fireEvent.change(input, { target: { value: "kanban" } });
		expect(onChange).toHaveBeenCalledWith("kanban");
		expect(
			screen.queryByRole("button", { name: "Limpiar búsqueda" }),
		).toBeNull();
	});

	it("renders clear button when value is non-empty and clears value on click", () => {
		const onChange = vi.fn();
		render(<SearchBar value="daily" onChange={onChange} />);

		const clearBtn = screen.getByRole("button", { name: "Limpiar búsqueda" });
		fireEvent.click(clearBtn);
		expect(onChange).toHaveBeenCalledWith("");
	});
});

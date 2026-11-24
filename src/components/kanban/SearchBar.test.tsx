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

	it("expands from the magnifying glass trigger and contracts back on Enter in expandable mode", () => {
		const onChange = vi.fn();
		const onExpandedChange = vi.fn();

		const { rerender } = render(
			<SearchBar
				value=""
				onChange={onChange}
				expandable
				expanded={false}
				onExpandedChange={onExpandedChange}
			/>,
		);

		const trigger = screen.getByRole("button", { name: "Buscar notas" });
		expect(trigger.getAttribute("aria-expanded")).toBe("false");

		fireEvent.click(trigger);
		expect(onExpandedChange).toHaveBeenCalledWith(true);

		rerender(
			<SearchBar
				value="notas"
				onChange={onChange}
				expandable
				expanded={true}
				onExpandedChange={onExpandedChange}
			/>,
		);

		const input = screen.getByPlaceholderText("Buscar notas...");
		fireEvent.keyDown(input, { key: "Enter" });
		expect(onExpandedChange).toHaveBeenCalledWith(false);
	});
});

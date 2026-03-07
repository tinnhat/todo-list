import { test, expect, Page } from "@playwright/test";

// ======================================================================
// Helper: clear localStorage and reload to get a clean state
// ======================================================================
async function resetApp(page: Page) {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForLoadState("networkidle");
}

// Helper: add a todo item using explicit input selectors to avoid ambiguity
async function addTodo(page: Page, title: string, description: string) {
  const titleInput = page.locator("#outlined-basic");
  const descInput = page.locator("#outlined-multiline-static");

  await titleInput.click();
  await titleInput.fill(title);
  await descInput.click();
  await descInput.fill(description);
  await page.getByRole("button", { name: "Submit" }).click();
}

// Helper: get ordered list of todo titles from the list
async function getTodoTitles(page: Page): Promise<string[]> {
  // Each todo title is an <h6> inside a Tooltip, but the page heading is <h4>.
  // The "No Todo" is also <h6> but we filter it out.
  // The card header "To do list" is a <p>.
  const titles = await page
    .locator(
      '.MuiCard-root:last-of-type h6.MuiTypography-h6:not(:has-text("No Todo"))'
    )
    .allTextContents();
  return titles.map((t) => t.trim());
}

// Helper: get a specific todo item row by its exact title
function getTodoRow(page: Page, title: string) {
  // Each todo item is a div with role="button" (from dnd-kit sortable attributes).
  // It contains an h6 with the title text.
  return page
    .locator('[role="button"]')
    .filter({ has: page.locator("h6", { hasText: title }) });
}

// ======================================================================
// 1. CRUD TESTS
// ======================================================================
test.describe("Todo CRUD Operations", () => {
  test.beforeEach(async ({ page }) => {
    await resetApp(page);
  });

  // ------------------------------------------------------------------
  // 1a. CREATE - Add a new todo
  // ------------------------------------------------------------------
  test("should add a new todo item", async ({ page }) => {
    // Verify empty state
    await expect(page.getByText("No Todo")).toBeVisible();

    // Add a todo
    await addTodo(page, "Buy groceries", "Milk, eggs, bread");

    // Verify toast
    await expect(page.getByText("Add todo successfully")).toBeVisible();

    // Verify the todo appears in the list
    await expect(
      page.locator("h6", { hasText: "Buy groceries" })
    ).toBeVisible();

    // Verify "No Todo" is gone
    await expect(page.getByText("No Todo")).not.toBeVisible();
  });

  // ------------------------------------------------------------------
  // 1b. CREATE - Validation: empty fields
  // ------------------------------------------------------------------
  test("should show validation errors for empty fields", async ({ page }) => {
    await page.getByRole("button", { name: "Submit" }).click();

    await expect(page.getByText("Title is required")).toBeVisible();
    await expect(page.getByText("Description is required")).toBeVisible();
  });

  // ------------------------------------------------------------------
  // 1c. CREATE - Validation: whitespace-only input
  // ------------------------------------------------------------------
  test("should reject whitespace-only input", async ({ page }) => {
    await addTodo(page, "   ", "   ");

    await expect(page.getByText("Please enter valid value")).toBeVisible();
  });

  // ------------------------------------------------------------------
  // 1d. CREATE - Add multiple todos
  // ------------------------------------------------------------------
  test("should add multiple todo items", async ({ page }) => {
    await addTodo(page, "Task One", "Desc One");
    await expect(page.getByText("Add todo successfully")).toBeVisible();
    await page.waitForTimeout(500);

    await addTodo(page, "Task Two", "Desc Two");
    await page.waitForTimeout(500);

    await addTodo(page, "Task Three", "Desc Three");

    // Verify all three items exist (use h6 to target title elements)
    await expect(page.locator("h6", { hasText: "Task One" })).toBeVisible();
    await expect(page.locator("h6", { hasText: "Task Two" })).toBeVisible();
    await expect(
      page.locator("h6", { hasText: "Task Three" })
    ).toBeVisible();
  });

  // ------------------------------------------------------------------
  // 1e. READ - Display todos from localStorage on reload
  // ------------------------------------------------------------------
  test("should persist todos across page reload", async ({ page }) => {
    await addTodo(page, "Persistent Task", "Survives reload");
    await expect(
      page.locator("h6", { hasText: "Persistent Task" })
    ).toBeVisible();

    await page.reload();
    await page.waitForLoadState("networkidle");

    await expect(
      page.locator("h6", { hasText: "Persistent Task" })
    ).toBeVisible();
  });

  // ------------------------------------------------------------------
  // 1f. UPDATE - Edit a todo item
  // ------------------------------------------------------------------
  test("should edit an existing todo item", async ({ page }) => {
    await addTodo(page, "Original Title", "Original Description");
    await expect(
      page.locator("h6", { hasText: "Original Title" })
    ).toBeVisible();

    // Click the Edit icon on that todo
    const todoRow = getTodoRow(page, "Original Title");
    await todoRow.locator('[data-testid="EditIcon"]').click();

    // Verify edit mode
    await expect(
      page.getByRole("button", { name: "Save" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Cancel" })
    ).toBeVisible();

    // The form should be pre-filled (use explicit ID selectors)
    const titleInput = page.locator("#outlined-basic");
    const descInput = page.locator("#outlined-multiline-static");

    await expect(titleInput).toHaveValue("Original Title");
    await expect(descInput).toHaveValue("Original Description");

    // Clear and type new values
    await titleInput.click();
    await titleInput.clear();
    await titleInput.fill("Updated Title");

    await descInput.click();
    await descInput.clear();
    await descInput.fill("Updated Description");

    // Save
    await page.getByRole("button", { name: "Save" }).click();

    // Verify toast
    await expect(
      page.getByText("Update todo successfully")
    ).toBeVisible();

    // Verify updated values in the list
    await expect(
      page.locator("h6", { hasText: "Updated Title" })
    ).toBeVisible();

    // Original values should be gone
    await expect(
      page.locator("h6", { hasText: "Original Title" })
    ).not.toBeVisible();
  });

  // ------------------------------------------------------------------
  // 1g. UPDATE - Cancel editing
  // ------------------------------------------------------------------
  test("should cancel editing and return to add mode", async ({ page }) => {
    await addTodo(page, "Task to Edit", "Some description");
    await expect(
      page.locator("h6", { hasText: "Task to Edit" })
    ).toBeVisible();

    // Enter edit mode
    const todoRow = getTodoRow(page, "Task to Edit");
    await todoRow.locator('[data-testid="EditIcon"]').click();
    await expect(
      page.getByRole("button", { name: "Save" })
    ).toBeVisible();

    // Modify the title
    const titleInput = page.locator("#outlined-basic");
    await titleInput.clear();
    await titleInput.fill("Modified but not saved");

    // Cancel
    await page.getByRole("button", { name: "Cancel" }).click();

    // Should be back to add mode
    await expect(
      page.getByRole("button", { name: "Submit" })
    ).toBeVisible();

    // Original item should remain unchanged
    await expect(
      page.locator("h6", { hasText: "Task to Edit" })
    ).toBeVisible();
  });

  // ------------------------------------------------------------------
  // 1h. UPDATE - Toggle status via edit checkbox
  // ------------------------------------------------------------------
  test("should toggle todo status via edit mode checkbox", async ({
    page,
  }) => {
    await addTodo(page, "Toggle Me", "Check my status");
    await expect(
      page.locator("h6", { hasText: "Toggle Me" })
    ).toBeVisible();

    // Enter edit mode
    const todoRow = getTodoRow(page, "Toggle Me");
    await todoRow.locator('[data-testid="EditIcon"]').click();

    // Toggle the status checkbox in edit mode
    await page.getByRole("checkbox", { name: "Checkbox status" }).click();

    // Save
    await page.getByRole("button", { name: "Save" }).click();

    await expect(
      page.getByText("Update todo successfully")
    ).toBeVisible();

    // After marking as complete, the item background should be green
    const updatedRow = getTodoRow(page, "Toggle Me");
    await expect(updatedRow).toHaveCSS(
      "background-color",
      "rgb(46, 204, 113)"
    );
  });

  // ------------------------------------------------------------------
  // 1i. DELETE - Remove a todo item
  // ------------------------------------------------------------------
  test("should delete a todo item", async ({ page }) => {
    await addTodo(page, "Delete Me", "This will be deleted");
    await expect(
      page.locator("h6", { hasText: "Delete Me" })
    ).toBeVisible();

    // Click delete icon
    const todoRow = getTodoRow(page, "Delete Me");
    await todoRow.locator('[data-testid="DeleteIcon"]').click();

    // Verify toast
    await expect(
      page.getByText("Delete todo successfully")
    ).toBeVisible();

    // Verify item is gone
    await expect(
      page.locator("h6", { hasText: "Delete Me" })
    ).not.toBeVisible();

    // Verify empty state returns
    await expect(page.getByText("No Todo")).toBeVisible();
  });

  // ------------------------------------------------------------------
  // 1j. DELETE - Delete one of multiple items
  // ------------------------------------------------------------------
  test("should delete specific item from multiple todos", async ({
    page,
  }) => {
    await addTodo(page, "Keep This", "I should remain");
    await page.waitForTimeout(300);
    await addTodo(page, "Remove This", "I should be removed");

    await expect(
      page.locator("h6", { hasText: "Keep This" })
    ).toBeVisible();
    await expect(
      page.locator("h6", { hasText: "Remove This" })
    ).toBeVisible();

    // Delete the second item
    const targetRow = getTodoRow(page, "Remove This");
    await targetRow.locator('[data-testid="DeleteIcon"]').click();

    // Verify
    await expect(
      page.getByText("Delete todo successfully")
    ).toBeVisible();
    await expect(
      page.locator("h6", { hasText: "Remove This" })
    ).not.toBeVisible();
    await expect(
      page.locator("h6", { hasText: "Keep This" })
    ).toBeVisible();
  });

  // ------------------------------------------------------------------
  // 1k. Toggle status via checkbox in the list
  // ------------------------------------------------------------------
  test("should toggle todo status via list checkbox", async ({ page }) => {
    await addTodo(page, "Toggle Task", "Toggle my checkbox");
    await expect(
      page.locator("h6", { hasText: "Toggle Task" })
    ).toBeVisible();

    // Click the checkbox in the list
    const todoRow = getTodoRow(page, "Toggle Task");
    await todoRow.getByRole("checkbox").click();

    // The todo item background should change to green
    await expect(todoRow).toHaveCSS(
      "background-color",
      "rgb(46, 204, 113)"
    );

    // Toggle back
    await todoRow.getByRole("checkbox").click();
    await expect(todoRow).toHaveCSS("background-color", "rgb(255, 255, 255)");
  });

  // ------------------------------------------------------------------
  // 1l. FILTER - Filter by status
  // ------------------------------------------------------------------
  test("should filter todos by status", async ({ page }) => {
    // Add two todos
    await addTodo(page, "Pending Task", "Still working");
    await page.waitForTimeout(300);
    await addTodo(page, "Complete Task", "Already done");

    // Mark "Complete Task" as complete via its checkbox
    const completeRow = getTodoRow(page, "Complete Task");
    await completeRow.getByRole("checkbox").click();

    // Verify it turned green
    await expect(completeRow).toHaveCSS(
      "background-color",
      "rgb(46, 204, 113)"
    );

    // Filter by "Pending"
    await page.getByRole("button", { name: "Filter" }).click();
    await page.getByRole("menuitem", { name: "Pending" }).click();

    await expect(
      page.locator("h6", { hasText: "Pending Task" })
    ).toBeVisible();
    await expect(
      page.locator("h6", { hasText: "Complete Task" })
    ).not.toBeVisible();

    // Filter by "Complete"
    await page.getByRole("button", { name: "Filter" }).click();
    await page.getByRole("menuitem", { name: "Complete" }).click();

    await expect(
      page.locator("h6", { hasText: "Complete Task" })
    ).toBeVisible();
    await expect(
      page.locator("h6", { hasText: "Pending Task" })
    ).not.toBeVisible();

    // Filter by "All"
    await page.getByRole("button", { name: "Filter" }).click();
    await page.getByRole("menuitem", { name: "All" }).click();

    await expect(
      page.locator("h6", { hasText: "Pending Task" })
    ).toBeVisible();
    await expect(
      page.locator("h6", { hasText: "Complete Task" })
    ).toBeVisible();
  });
});

// ======================================================================
// 2. DRAG AND DROP TESTS
// ======================================================================
test.describe("Todo Drag and Drop", () => {
  test.beforeEach(async ({ page }) => {
    await resetApp(page);
  });

  test("should reorder todos via drag and drop", async ({ page }) => {
    // Add 3 todos with delays to ensure unique IDs
    await addTodo(page, "First Item", "Desc First");
    await page.waitForTimeout(300);
    await addTodo(page, "Second Item", "Desc Second");
    await page.waitForTimeout(300);
    await addTodo(page, "Third Item", "Desc Third");

    // Wait for all items to be visible
    await expect(
      page.locator("h6", { hasText: "First Item" })
    ).toBeVisible();
    await expect(
      page.locator("h6", { hasText: "Second Item" })
    ).toBeVisible();
    await expect(
      page.locator("h6", { hasText: "Third Item" })
    ).toBeVisible();

    // Verify initial order
    const initialOrder = await getTodoTitles(page);
    expect(initialOrder).toEqual([
      "First Item",
      "Second Item",
      "Third Item",
    ]);

    // Perform drag and drop: drag "First Item" below "Third Item"
    // dnd-kit uses PointerSensor with 10px activation distance
    const firstItemTitle = page.locator("h6", { hasText: "First Item" });
    const thirdItemTitle = page.locator("h6", { hasText: "Third Item" });

    const firstBox = await firstItemTitle.boundingBox();
    const thirdBox = await thirdItemTitle.boundingBox();

    if (!firstBox || !thirdBox) {
      throw new Error("Could not get bounding boxes for drag items");
    }

    const startX = firstBox.x + firstBox.width / 2;
    const startY = firstBox.y + firstBox.height / 2;
    // Target: well below the third item
    const endY = thirdBox.y + thirdBox.height + 20;

    // Simulate pointer drag
    await page.mouse.move(startX, startY);
    await page.mouse.down();

    // Move past the 10px activation threshold
    await page.mouse.move(startX, startY + 15, { steps: 5 });
    await page.waitForTimeout(150);

    // Move to the target position
    await page.mouse.move(startX, endY, { steps: 30 });
    await page.waitForTimeout(300);

    // Drop
    await page.mouse.up();
    await page.waitForTimeout(500);

    // Verify new order: First Item should have moved
    const newOrder = await getTodoTitles(page);

    // The first item should no longer be first
    expect(newOrder[0]).not.toBe("First Item");
    // All items should still exist
    expect(newOrder).toHaveLength(3);
    expect(newOrder).toContain("First Item");
    expect(newOrder).toContain("Second Item");
    expect(newOrder).toContain("Third Item");
  });

  test("should persist drag and drop reorder after reload", async ({
    page,
  }) => {
    // Add 2 todos
    await addTodo(page, "ItemAlpha", "Desc Alpha");
    await page.waitForTimeout(300);
    await addTodo(page, "ItemBeta", "Desc Beta");

    await expect(
      page.locator("h6", { hasText: "ItemAlpha" })
    ).toBeVisible();
    await expect(
      page.locator("h6", { hasText: "ItemBeta" })
    ).toBeVisible();

    // Verify initial order
    const initialOrder = await getTodoTitles(page);
    expect(initialOrder).toEqual(["ItemAlpha", "ItemBeta"]);

    // Drag ItemBeta above ItemAlpha
    const betaTitle = page.locator("h6", { hasText: "ItemBeta" });
    const alphaTitle = page.locator("h6", { hasText: "ItemAlpha" });

    const betaBox = await betaTitle.boundingBox();
    const alphaBox = await alphaTitle.boundingBox();

    if (!betaBox || !alphaBox) {
      throw new Error("Could not get bounding boxes for drag items");
    }

    const startX = betaBox.x + betaBox.width / 2;
    const startY = betaBox.y + betaBox.height / 2;
    const endY = alphaBox.y - 10;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX, startY - 15, { steps: 5 });
    await page.waitForTimeout(150);
    await page.mouse.move(startX, endY, { steps: 30 });
    await page.waitForTimeout(300);
    await page.mouse.up();
    await page.waitForTimeout(500);

    // Check localStorage to verify the order was saved
    const storedOrder = await page.evaluate(() => {
      const data = localStorage.getItem("listTodo");
      if (!data) return [];
      return JSON.parse(data).map((item: any) => item.title);
    });

    // The order should have changed
    expect(storedOrder).toHaveLength(2);
    expect(storedOrder[0]).toBe("ItemBeta");
    expect(storedOrder[1]).toBe("ItemAlpha");

    // Reload and verify order persists
    await page.reload();
    await page.waitForLoadState("networkidle");

    const reloadedOrder = await getTodoTitles(page);
    expect(reloadedOrder).toEqual(["ItemBeta", "ItemAlpha"]);
  });
});

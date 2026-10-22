n = int(input("Enter number of books: "))
books = {}

for i in range(n):
    name = input("Enter book name: ")
    books[name] = True

while True:
    print("\n1. Issue Book")
    print("2. Return Book")
    print("3. View Books")
    print("4. Exit")

    choice = input("Enter choice: ")

    if choice == "1":
        book = input("Enter book name: ")
        if book in books and books[book]:
            books[book] = False
            print("Book issued successfully")
        else:
            print("Book unavailable or not found")

    elif choice == "2":
        book = input("Enter book name: ")
        if book in books and not books[book]:
            books[book] = True
            print("Book returned successfully")
        else:
            print("Invalid book or book already available")

    elif choice == "3":
        for book, available in books.items():
            status = "Available" if available else "Issued"
            print(book, "-", status)

    elif choice == "4":
        break

    else:
        print("Invalid choice")
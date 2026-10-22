balance = 5000

while True:
    print("\n1. Deposit")
    print("2. Withdraw")
    print("3. Check Balance")
    print("4. Exit")

    choice = input("Enter choice: ")

    if choice == "1":
        amount = float(input("Enter deposit amount: "))
        if amount > 0:
            balance += amount
            print("Amount deposited successfully")

    elif choice == "2":
        amount = float(input("Enter withdrawal amount: "))
        if 0 < amount <= balance:
            balance -= amount
            print("Withdrawal successful")
        else:
            print("Insufficient balance or invalid amount")

    elif choice == "3":
        print("Current balance:", balance)

    elif choice == "4":
        break

    else:
        print("Invalid choice")
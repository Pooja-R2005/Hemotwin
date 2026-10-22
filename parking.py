capacity = 5
parked_cars = []
while True:
    print("\n1. Park Car")
    print("2. Remove Car")
    print("3. View Parking")
    print("4. Exit")
    choice = input("Enter choice: ")
    if choice == "1":
        car = input("Enter car number: ")
        if car in parked_cars:
            print("Car already parked")
        elif len(parked_cars) < capacity:
            parked_cars.append(car)
            print("Car parked successfully")
        else:
            print("Parking lot is full")
    elif choice == "2":
        car = input("Enter car number: ")
        if car in parked_cars:
            parked_cars.remove(car)
            print("Car removed successfully")
        else:
            print("Car not found")
    elif choice == "3":
        print("Parked cars:", parked_cars)
        print("Available spaces:", capacity - len(parked_cars))
    elif choice == "4":
        break
    else:
        print("Invalid choice")
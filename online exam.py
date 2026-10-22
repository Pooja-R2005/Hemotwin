
stu= [
    ["S1", ["A", "B", "C", "D", "A"]],
    ["S2", ["A", "C", "C", "B", "D"]],
    ["S3", ["B", "B", "D", "D", "A"]]
]
key = ["A", "B", "C", "D", "A"]
results = []
for student in stu:
    correct = incorrect = unanswered = 0
    for i in range(5):
        if student[1][i] is None:
            unanswered += 1
        elif student[1][i] == key[i]:
            correct += 1
        else:
            incorrect += 1

    score = correct * 4 - incorrect
    result = "Pass" if score >= 10 else "Fail"

    results.append([student[0], correct, incorrect,
                    unanswered, score, result])

results.sort(key=lambda x: x[4], reverse=True)

rank = 0
previous = None

for i, r in enumerate(results):
    if r[4] != previous:
        rank = i + 1
    previous = r[4]
    print(r[0], r[1], r[2], r[3], r[4], r[5], "Rank:", rank)
    

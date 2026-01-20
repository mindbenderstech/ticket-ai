#!/usr/bin/env python3
"""
Dataset Generator for MongoDB Query Training
Generates synthetic training examples for fine-tuning LLaMA
"""

import json
import random
import argparse
from datetime import datetime, timedelta

# Query templates and variations
STATUSES = ["open", "closed", "in_progress", "resolved", "pending"]
PRIORITIES = ["low", "medium", "high", "urgent", "critical"]
USERS = ["John", "Sarah", "Mike", "Emily", "David", "Lisa", "Tom", "Anna"]
TAGS = ["bug", "feature", "enhancement", "documentation", "urgent", "security"]

# Question templates with corresponding queries
TEMPLATES = [
    # Simple field matching
    {
        "questions": [
            "Show me all {status} tickets",
            "Find {status} tickets",
            "Get all {status} tickets",
            "List {status} tickets"
        ],
        "query": '{{"status": "{status}"}}'
    },
    {
        "questions": [
            "Show me all {priority} priority tickets",
            "Find {priority} priority tickets",
            "Get tickets with {priority} priority"
        ],
        "query": '{{"priority": "{priority}"}}'
    },
    {
        "questions": [
            "Show me tickets assigned to {user}",
            "Find tickets for {user}",
            "Get {user}'s tickets",
            "List tickets assigned to {user}"
        ],
        "query": '{{"assignee": "{user}"}}'
    },
    # Multiple conditions
    {
        "questions": [
            "Show me {priority} priority {status} tickets",
            "Find {status} tickets with {priority} priority",
            "Get all {status} and {priority} priority tickets"
        ],
        "query": '{{"status": "{status}", "priority": "{priority}"}}'
    },
    {
        "questions": [
            "Show me {status} tickets assigned to {user}",
            "Find {user}'s {status} tickets",
            "Get {status} tickets for {user}"
        ],
        "query": '{{"status": "{status}", "assignee": "{user}"}}'
    },
    # Array operations
    {
        "questions": [
            "Show me tickets tagged as {tag}",
            "Find tickets with {tag} tag",
            "Get all {tag} tickets"
        ],
        "query": '{{"tags": "{tag}"}}'
    },
    {
        "questions": [
            "Show me tickets assigned to {user1} or {user2}",
            "Find tickets for {user1} or {user2}",
            "Get tickets assigned to either {user1} or {user2}"
        ],
        "query": '{{"assignee": {{"$in": ["{user1}", "{user2}"]}}}}'
    },
    # Text search
    {
        "questions": [
            "Find tickets with '{keyword}' in the title",
            "Show me tickets containing '{keyword}'",
            "Search for tickets with '{keyword}'"
        ],
        "query": '{{"title": {{"$regex": "{keyword}", "$options": "i"}}}}'
    },
    # Existence checks
    {
        "questions": [
            "Show me unassigned tickets",
            "Find tickets not assigned to anyone",
            "Get tickets without an assignee"
        ],
        "query": '{{"assignee": {{"$exists": false}}}}'
    },
    {
        "questions": [
            "Show me assigned tickets",
            "Find tickets with an assignee",
            "Get tickets that are assigned"
        ],
        "query": '{{"assignee": {{"$exists": true}}}}'
    },
    # Comparisons
    {
        "questions": [
            "Show me tickets with more than {count} comments",
            "Find tickets with over {count} comments",
            "Get tickets that have more than {count} comments"
        ],
        "query": '{{"commentCount": {{"$gt": {count}}}}}'
    }
]

def generate_example(template):
    """Generate a single training example from a template"""
    question_template = random.choice(template["questions"])
    query_template = template["query"]

    # Fill in placeholders
    replacements = {
        "status": random.choice(STATUSES),
        "priority": random.choice(PRIORITIES),
        "user": random.choice(USERS),
        "user1": random.choice(USERS[:4]),
        "user2": random.choice(USERS[4:]),
        "tag": random.choice(TAGS),
        "keyword": random.choice(["login", "payment", "error", "API", "dashboard"]),
        "count": str(random.choice([3, 5, 10, 15]))
    }

    question = question_template
    query = query_template

    for key, value in replacements.items():
        question = question.replace(f"{{{key}}}", value)
        query = query.replace(f"{{{key}}}", value)

    return {
        "instruction": "Convert the following question to a MongoDB query",
        "input": question,
        "output": query
    }

def generate_dataset(num_examples):
    """Generate a complete dataset"""
    examples = []

    for _ in range(num_examples):
        template = random.choice(TEMPLATES)
        example = generate_example(template)
        examples.append(example)

    return examples

def main():
    parser = argparse.ArgumentParser(description='Generate training dataset for MongoDB query generation')
    parser.add_argument('--num-examples', type=int, default=100, help='Number of examples to generate')
    parser.add_argument('--output', type=str, default='generated_dataset.jsonl', help='Output file path')

    args = parser.parse_args()

    print(f"Generating {args.num_examples} training examples...")
    dataset = generate_dataset(args.num_examples)

    # Write to JSONL file
    with open(args.output, 'w') as f:
        for example in dataset:
            f.write(json.dumps(example) + '\n')

    print(f"Dataset saved to {args.output}")
    print(f"Total examples: {len(dataset)}")

if __name__ == "__main__":
    main()

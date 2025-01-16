from optimized_prompt import TestingAssistant

def test_prompt_scenarios():
    """Test various scenarios to verify prompt improvements"""
    
    # Initialize assistant
    assistant = TestingAssistant("Max MAI", "MSPH")
    contact = "Tianhui Du (Beyondsoft)"
    
    # Scenario 1: No case_set (error handling)
    prompt1 = assistant.generate_prompt(contact)
    print("\nScenario 1 - No case_set:")
    print(prompt1)
    
    # Scenario 2: New task assignment
    case_set = {"type": "automated_test", "status": "pending"}
    prompt2 = assistant.generate_prompt(contact, case_set, "automated API testing")
    print("\nScenario 2 - New task assignment:")
    print(prompt2)
    
    # Scenario 3: Task in progress
    assistant.current_task = {"type": "automated_test", "status": "in_progress"}
    prompt3 = assistant.generate_prompt(contact, case_set)
    print("\nScenario 3 - Task in progress:")
    print(prompt3)
    
    # Scenario 4: Multiple tasks history
    assistant.task_history = [
        {"type": "UI Testing", "status": "completed"},
        {"type": "Performance Test", "status": "completed"},
        {"type": "automated_test", "status": "in_progress"}
    ]
    prompt4 = assistant.generate_prompt(contact, case_set)
    print("\nScenario 4 - With task history:")
    print(prompt4)

if __name__ == "__main__":
    test_prompt_scenarios()

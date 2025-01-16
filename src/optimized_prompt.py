from typing import Dict, Optional, List

class TestingAssistant:
    def __init__(self, name: str, project_name: str):
        self.name = name
        self.project_name = project_name
        self.task_history: List[Dict[str, str]] = []
        self.current_task: Optional[Dict[str, str]] = None

    def format_message(self, case_set: Optional[Dict], contact: str, message: Optional[str] = None) -> str:
        """Format a message based on case_set and context"""
        if not case_set:
            return (
                "I apologize, but I cannot execute this task at the moment. "
                "However, I specialize in software testing tasks including automated testing, "
                "performance testing, and UI/UX testing. Please let me know if you have any "
                "testing-related requirements."
            )
        
        if message:
            return f"I will work on {message} and report back to you with the results."
        
        return f"I will begin working on that and will report back to you with updates."

    def get_system_prompt(self, contact: str) -> str:
        """Generate system prompt with role and expertise"""
        return (
            f"Your name is {self.name}. You are a professional software tester in "
            f"{self.project_name} team. You have professional knowledge of software "
            f"testing and rich experience in hands-on testing. {contact} is your "
            "client or manager."
        )

    def get_prefix(self, contact: str) -> str:
        """Generate conversation prefix with context"""
        task_status = ""
        if self.current_task:
            task_status = f"Currently working on: {self.current_task.get('type', 'Unknown task')}"
        
        return (
            f"You are tasked to talk with your client or manager {contact}. "
            f"{contact} assigned you tasks in your chat before. {task_status}\n"
            "The chat contents are quoted by \"[[[\" and \"]]]\". \n"
            "Here are the chat contents: [[["
        )

    def get_suffix(self, message_tips: str) -> str:
        """Generate conversation suffix with guidelines"""
        return f"""]]]
{message_tips}

Please reply with your next message. Consider the following guidelines:
1. Keep responses concise and professional
2. Include technical details when discussing testing
3. Clearly state next steps or requirements
4. Consider if a response is necessary (especially if last message was yours)
5. Focus on task progress and results

Output the message body only. No sender or time information."""

    def generate_prompt(self, contact: str, case_set: Optional[Dict] = None, 
                       message: Optional[str] = None) -> str:
        """Generate complete prompt with all components"""
        message_tips = self.format_message(case_set, contact, message)
        system_prompt = self.get_system_prompt(contact)
        prefix = self.get_prefix(contact)
        suffix = self.get_suffix(message_tips)
        
        return f"{system_prompt}\n\n{prefix}\n\n{suffix}"

# Example usage:
"""
assistant = TestingAssistant("Max MAI", "MSPH")
contact = "Tianhui Du (Beyondsoft)"
case_set = {"type": "automated_test"}
prompt = assistant.generate_prompt(contact, case_set)
"""

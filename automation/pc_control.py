from backend.tools.pc_control import PCControl


class AutomationPCControl:
    def __init__(self):
        self.controller = PCControl()

    def open_application(self, name: str):
        return self.controller.open_application(name)

    def screenshot(self, path: str = "./logs/screenshot.png"):
        return self.controller.screenshot(path)

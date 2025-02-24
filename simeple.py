import sys
from PyQt5.QtWidgets import QApplication, QMainWindow, QToolBar, QAction, QLabel
from PyQt5.QtWebEngineWidgets import QWebEngineView, QWebEngineSettings
from PyQt5.QtCore import QUrl, QSize, QTimer, Qt, QElapsedTimer
import psutil
import os

class SimpleBrowser(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Simple HTML Browser - Windows 98 Style")
        self.setGeometry(100, 100, 800, 600)

        self.web_view = QWebEngineView()
        self.setCentralWidget(self.web_view)

        self.toolbar = self.create_toolbar()
        self.addToolBar(self.toolbar)

        self.default_html_path = 'index.html'
        self.load_default_file()

        self.init_fps_monitor()
        self.enable_webgl()
        self.init_memory_monitor()

        self.optimize_for_memory()
        self.optimize_webengine_settings()

    def create_toolbar(self):
        toolbar = QToolBar("Main Toolbar", self)
        toolbar.setIconSize(QSize(32, 32))
        toolbar.setStyleSheet("QToolBar { background: #C0C0C0; }")

        actions = [
            ("Back", self.web_view.back),
            ("Forward", self.web_view.forward),
            ("Refresh", self.web_view.reload)
        ]

        for name, func in actions:
            action = QAction(name, self)
            action.setIconText(name)
            action.triggered.connect(func)
            toolbar.addAction(action)

        return toolbar

    def load_default_file(self):
        if os.path.exists(self.default_html_path):
            file_url = QUrl.fromLocalFile(os.path.abspath(self.default_html_path))
            self.web_view.setUrl(file_url)
        else:
            self.web_view.setHtml(f"<html><body style='background-color: #C0C0C0; color: black;'>Default file '{self.default_html_path}' not found.</body></html>")

    def init_fps_monitor(self):
        self.fps_label = QLabel(self)
        self.fps_label.setStyleSheet("background: #E0E0E0; border: 2px solid black; padding: 5px;")
        self.fps_label.setAlignment(Qt.AlignCenter)
        self.statusBar().addPermanentWidget(self.fps_label)

        self.fps_warning_box = QLabel(self)
        self.fps_warning_box.setStyleSheet("background: green; border: 2px solid black; padding: 5px;")
        self.fps_warning_box.setAlignment(Qt.AlignCenter)
        self.fps_warning_box.setText("FPS OK")
        self.statusBar().addPermanentWidget(self.fps_warning_box)

        self.elapsed_timer = QElapsedTimer()
        self.elapsed_timer.start()

        self.frame_count = 0
        self.total_frames = 0
        self.total_time = 0
        self.target_fps = 60
        self.frame_interval = int(1000 / self.target_fps)
        self.timer = QTimer(self)
        self.timer.timeout.connect(self.update_fps)
        self.timer.start(self.frame_interval * 2)  # Increase update interval

    def update_fps(self):
        self.frame_count += 1
        self.total_frames += 1
        elapsed_ms = self.elapsed_timer.elapsed()
        self.total_time += elapsed_ms
        if elapsed_ms >= 2000:  # Update FPS display every 2 seconds
            fps = self.frame_count / (elapsed_ms / 1000.0)
            average_fps = self.total_frames / (self.total_time / 1000.0)
            self.fps_label.setText(f"FPS: {fps:.2f} (Avg: {average_fps:.2f})")
            self.frame_count = 0
            self.elapsed_timer.restart()

            if fps >= self.target_fps:
                self.fps_warning_box.setStyleSheet("background: green; border: 2px solid black; padding: 5px;")
                self.fps_warning_box.setText("FPS High")
            elif 30 <= fps < self.target_fps:
                self.fps_warning_box.setStyleSheet("background: yellow; border: 2px solid black; padding: 5px;")
                self.fps_warning_box.setText("FPS Moderate")
            else:
                self.fps_warning_box.setStyleSheet("background: red; border: 2px solid black; padding: 5px;")
                self.fps_warning_box.setText("FPS Low")

    def enable_webgl(self):
        self.web_view.settings().setAttribute(QWebEngineSettings.WebGLEnabled, True)

    def init_memory_monitor(self):
        self.memory_label = QLabel(self)
        self.memory_label.setStyleSheet("background: #E0E0E0; border: 2px solid black; padding: 5px;")
        self.memory_label.setAlignment(Qt.AlignCenter)
        self.statusBar().addPermanentWidget(self.memory_label)

        self.memory_timer = QTimer(self)
        self.memory_timer.timeout.connect(self.update_memory_usage)
        self.memory_timer.start(1000)

    def update_memory_usage(self):
        process = psutil.Process(os.getpid())
        memory_info = process.memory_info()
        memory_usage = memory_info.rss / (1024 * 1024)
        self.memory_label.setText(f"Memory Usage: {memory_usage:.2f} MB")

    def optimize_for_memory(self):
        total_memory = psutil.virtual_memory().total / (1024 * 1024 * 1024)
        if total_memory <= 4:
            self.timer.setInterval(33)
            self.enable_caching(True)
        elif total_memory <= 6:
            self.timer.setInterval(25)
            self.enable_caching(False)
        else:
            self.timer.setInterval(16)
            self.enable_caching(False)

    def enable_caching(self, use_cache):
        if use_cache:
            self.web_view.settings().setAttribute(QWebEngineSettings.LocalStorageEnabled, True)
        else:
            self.web_view.settings().setAttribute(QWebEngineSettings.LocalStorageEnabled, False)

    def optimize_webengine_settings(self):
        settings = self.web_view.settings()
        settings.setAttribute(QWebEngineSettings.JavascriptCanOpenWindows, False)
        settings.setAttribute(QWebEngineSettings.PluginsEnabled, False)
        settings.setAttribute(QWebEngineSettings.FullScreenSupportEnabled, False)
        settings.setAttribute(QWebEngineSettings.ScrollAnimatorEnabled, False)
        settings.setAttribute(QWebEngineSettings.AutoLoadIconsForPage, False)
        settings.setAttribute(QWebEngineSettings.HyperlinkAuditingEnabled, False)
        settings.setAttribute(QWebEngineSettings.ErrorPageEnabled, False)

if __name__ == "__main__":
    app = QApplication(sys.argv)
    app.setStyleSheet("""
        QMainWindow { background: #C0C0C0; }
        QWebEngineView { background: white; border: 2px solid black; }
        QToolBar QToolButton { margin: 5px; padding: 5px; background: #E0E0E0; border: 2px outset white; }
        QToolBar QToolButton:hover { background: #D0D0D0; border: 2px outset lightgray; }
    """)
    browser = SimpleBrowser()
    browser.show()
    sys.exit(app.exec_())

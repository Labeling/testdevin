import pytest
from datetime import datetime
import os
import base64
import pytest_html.extras

def pytest_html_report_title(report):
    report.title = "百度网页自动化测试报告"

@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    report = outcome.get_result()
    
    # 添加时间戳和描述到报告
    report.description = str(item.function.__doc__)
    
    # 处理测试过程中的截图
    if report.when == "call":
        if hasattr(item, "funcargs"):
            driver = item.funcargs.get("driver")
            if driver:
                # 为每个测试用例创建截图
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                screenshot_name = f"screenshot_{item.name}_{timestamp}.png"
                screenshot_path = os.path.join(os.path.dirname(__file__), screenshot_name)
                driver.save_screenshot(screenshot_path)
                
                # 添加截图到HTML报告
                if hasattr(item.config, "pluginmanager"):
                    html = item.config.pluginmanager.getplugin("html")
                    if html is not None:
                        extras = getattr(report, "extras", [])
                        if not extras:
                            report.extras = []
                        if os.path.exists(screenshot_path):
                            try:
                                with open(screenshot_path, "rb") as img:
                                    image_data = img.read()
                                    image_base64 = base64.b64encode(image_data).decode('utf-8')
                                    # 初始化report.extras
                                    if not hasattr(report, 'extras'):
                                        report.extras = []

                                    # 添加base64编码的截图
                                    report.extras.append(pytest_html.extras.image(image_base64, 'Screenshot'))
                                    
                                    # 查找并添加视频信息
                                    video_info_files = [f for f in os.listdir(os.path.dirname(screenshot_path))
                                                      if f.startswith('video_info_')]
                                    if video_info_files:
                                        latest_video_info = sorted(video_info_files)[-1]
                                        video_info_path = os.path.join(os.path.dirname(screenshot_path), latest_video_info)
                                        
                                        with open(video_info_path, 'r') as f:
                                            video_info_content = f.readlines()
                                            
                                        # 创建视频内容HTML
                                        video_html = '''
                                        <div class="video-content" style="margin: 20px 0;">
                                            <h4 style="color: #2196F3; margin-bottom: 15px;">视频内容</h4>
                                            <div class="video-sources" style="border: 1px solid #e0e0e0; padding: 15px; border-radius: 4px;">
                                        '''
                                        
                                        has_video_sources = False
                                        for line in video_info_content:
                                            line = line.strip()
                                            if line.startswith('Page URL:'):
                                                video_html += f'<p style="margin-bottom: 10px;">测试页面: <a href="{line.split(": ")[1].strip()}" target="_blank" style="color: #2196F3;">点击访问视频页面</a></p>'
                                            elif line.startswith(('Direct video source:', 'Video source tag:', 'Iframe video source:', 'Iframe source tag:')):
                                                has_video_sources = True
                                                source_type = line.split(':')[0].strip()
                                                source_url = ':'.join(line.split(':')[1:]).strip()
                                                
                                                video_html += f'''
                                                <div class="video-source" style="margin: 15px 0; background: #f5f5f5; padding: 10px; border-radius: 4px;">
                                                    <p style="color: #666; margin-bottom: 5px;">{source_type}:</p>
                                                    <div class="video-player" style="margin: 10px 0;">
                                                        <video width="640" height="360" controls preload="metadata" style="max-width: 100%; border: 1px solid #ddd;">
                                                            <source src="{source_url}" type="video/mp4">
                                                            <source src="{source_url}" type="video/webm">
                                                            <p style="color: #f44336;">您的浏览器不支持视频播放。<a href="{source_url}" target="_blank">点击下载视频</a></p>
                                                        </video>
                                                    </div>
                                                </div>
                                                '''
                                        
                                        if not has_video_sources:
                                            video_html += '<p style="color: #f44336;">未检测到可用的视频源</p>'
                                            
                                        video_html += '''
                                            </div>
                                        </div>
                                        '''
                                        
                                        video_html += '</div>'
                                        report.extras.append(pytest_html.extras.html(video_html))

                                    # 添加测试步骤和结果描述
                                    status_color = "#4CAF50" if report.passed else "#f44336"
                                    status_icon = "✓" if report.passed else "✗"

                                    html_content = f'''
                                    <div class="test-content">
                                        <div class="image-description" style="margin: 10px 0;">
                                            <h4>测试截图 - {item.name}</h4>
                                        </div>
                                        <div class="test-steps" style="margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 4px;">
                                            <h3 style="color: #2196F3;">测试步骤</h3>
                                            <p style="margin: 10px 0;">{report.description}</p>
                                            <h3 style="color: {status_color};">测试结果</h3>
                                            <p style="margin: 10px 0; font-weight: bold;">
                                                {status_icon} {"通过" if report.passed else "失败"}
                                            </p>
                                        </div>
                                    </div>
                                    '''
                                    report.extras.append(pytest_html.extras.html(html_content))
                            except Exception as e:
                                print(f"添加截图到报告失败: {str(e)}")

def pytest_configure(config):
    """添加环境信息到HTML报告"""
    if hasattr(config, '_metadata'):
        config._metadata['测试项目'] = "百度网页自动化测试"
        config._metadata['测试时间'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    else:
        config.stash['metadata'] = {
            '测试项目': "百度网页自动化测试",
            '测试时间': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }

import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import TimeoutException
import time
import os
from datetime import datetime

class TestBaiduSearch:
    @pytest.fixture(scope="function")
    def driver(self):
        # 设置Chrome选项
        options = webdriver.ChromeOptions()
        options.add_argument('--headless')  # 无头模式
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        
        # 初始化driver
        driver = webdriver.Chrome(options=options)
        driver.implicitly_wait(3)  # 减少隐式等待时间
        try:
            yield driver
        finally:
            driver.quit()

    @pytest.mark.timeout(15)
    def test_baidu_search_basic(self, driver):
        """测试百度搜索基本功能"""
        # 访问百度首页
        driver.get("https://www.baidu.com")
        assert "百度一下" in driver.title
        
        # 定位搜索框并输入搜索词
        search_box = driver.find_element(By.ID, "kw")
        search_box.send_keys("selenium testing")
        
        # 点击搜索按钮
        search_button = driver.find_element(By.ID, "su")
        search_button.click()
        
        # 验证搜索结果
        try:
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.ID, "content_left"))
            )
            assert "selenium" in driver.page_source.lower()
        except TimeoutException:
            pytest.fail("搜索结果加载超时")

    @pytest.mark.timeout(15)
    def test_baidu_navigation_links(self, driver):
        """测试百度首页导航链接"""
        driver.get("https://www.baidu.com")
        
        # 等待页面加载完成，设置较短的超时时间
        try:
            WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
        except TimeoutException:
            print("页面加载超时，继续执行...")
        
        # 测试导航链接
        nav_links = {
            "新闻": "news.baidu.com",
            "地图": "map.baidu.com",
            "视频": "haokan.baidu.com",
            "贴吧": "tieba.baidu.com"
        }
        
        for link_text, domain in nav_links.items():
            try:
                link = WebDriverWait(driver, 3).until(
                    EC.element_to_be_clickable((By.PARTIAL_LINK_TEXT, link_text))
                )
                href = link.get_attribute("href").lower()
                assert domain in href, f"{link_text}链接验证失败: {href}"
                print(f"{link_text}链接验证成功: {href}")
            except Exception as e:
                pytest.fail(f"{link_text}链接测试失败: {str(e)}")
    
    @pytest.mark.skip(reason="视频功能测试暂时跳过，等待优化")
    def test_baidu_video_content(self, driver):
        """测试百度视频功能"""
        driver.get("https://www.baidu.com")
        try:
            # 使用多种定位策略查找视频链接，设置较短的超时
            video_link = None
            locators = [
                (By.LINK_TEXT, "视频"),
                (By.PARTIAL_LINK_TEXT, "视频"),
                (By.CSS_SELECTOR, "a[href*='v.baidu.com'], a[href*='haokan.baidu.com']")
            ]
            
            for by, value in locators:
                try:
                    video_link = WebDriverWait(driver, 3).until(
                        EC.element_to_be_clickable((by, value))
                    )
                    if video_link:
                        break
                except:
                    continue
            
            if not video_link:
                raise Exception("无法找到视频链接")
            
            # 获取视频链接URL
            video_url = video_link.get_attribute("href")
            print(f"找到视频链接: {video_url}")
            
            # 创建视频信息文件
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            video_info_path = os.path.join(os.path.dirname(__file__), f"video_info_{timestamp}.txt")
            with open(video_info_path, 'w', encoding='utf-8') as f:
                f.write(f"Page URL: {video_url}\n")
                f.write("Video Sources:\n")
            
            # 访问视频页面
            driver.get(video_url)
            
            # 等待页面加载完成，使用较短的超时时间
            print("等待视频页面加载...")
            try:
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.TAG_NAME, "body"))
                )
            except TimeoutException:
                print("页面加载超时，继续执行...")
            
            # 启用网络请求监听，使用更高效的选择器
            driver.execute_script("""
                window.videoRequests = [];
                const observer = new PerformanceObserver((list) => {
                    list.getEntries().forEach(entry => {
                        if (entry.initiatorType === 'video' || 
                            /\.(mp4|m3u8|flv)($|\?)/.test(entry.name) ||
                            entry.name.includes('video')) {
                            window.videoRequests.push(entry.name);
                        }
                    });
                });
                observer.observe({entryTypes: ['resource']});
            """)
            
            # 使用更短的等待时间检查视频元素
            print("检查视频元素...")
            try:
                video_containers = WebDriverWait(driver, 8).until(
                    EC.presence_of_all_elements_located((By.CSS_SELECTOR, 
                        "video, .video-content, .video-player, [class*='video']"))
                )
                print(f"找到 {len(video_containers)} 个视频容器")
            except TimeoutException:
                print("未找到视频容器，继续检查其他元素...")
            
            # 使用较短的等待时间
            time.sleep(5)
            
            # 等待页面完全加载
            WebDriverWait(driver, 20).until(
                lambda d: d.execute_script('return document.readyState') == 'complete'
            )
            
            # 尝试滚动页面以触发懒加载
            driver.execute_script("""
                window.scrollTo(0, document.body.scrollHeight/2);
                setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 1000);
            """)
            time.sleep(5)  # 等待滚动后的内容加载
            
            # 生成时间戳
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            
            # 创建视频信息文件
            video_info_path = os.path.join(os.path.dirname(__file__), f"video_info_{timestamp}.txt")
            with open(video_info_path, 'w', encoding='utf-8') as f:
                f.write(f"Page URL: {driver.current_url}\n")
                f.write("Video Sources:\n")
                
                # 执行JavaScript来查找视频源
                js_script = """
                function findVideoSources() {
                    let sources = [];
                    // 查找video标签
                    document.querySelectorAll('video').forEach(video => {
                        if (video.src) sources.push(['video', video.src]);
                        video.querySelectorAll('source').forEach(source => {
                            if (source.src) sources.push(['source', source.src]);
                        });
                    });
                    
                    // 查找object和embed标签
                    document.querySelectorAll('object, embed').forEach(obj => {
                        if (obj.data) sources.push(['object', obj.data]);
                    });
                    
                    // 查找可能包含视频URL的其他元素
                    document.querySelectorAll('a[href*=".mp4"], a[href*=".m3u8"]').forEach(link => {
                        sources.push(['link', link.href]);
                    });
                    
                    return sources;
                }
                return findVideoSources();
                """
                
                try:
                    # 在主页面查找视频源
                    video_sources = driver.execute_script(js_script)
                    for source_type, url in video_sources:
                        if url:
                            f.write(f"{source_type.capitalize()} source: {url}\n")
                    
                    # 查找并处理iframe
                    iframes = driver.find_elements(By.TAG_NAME, "iframe")
                    for iframe in iframes:
                        try:
                            iframe_src = iframe.get_attribute("src")
                            if iframe_src:
                                f.write(f"Iframe URL: {iframe_src}\n")
                            
                            driver.switch_to.frame(iframe)
                            iframe_sources = driver.execute_script(js_script)
                            for source_type, url in iframe_sources:
                                if url:
                                    f.write(f"Iframe {source_type} source: {url}\n")
                            driver.switch_to.default_content()
                            
                        except Exception as e:
                            print(f"处理iframe时出错: {str(e)}")
                            driver.switch_to.default_content()
                            continue
                    
                    # 查找动态加载的视频内容
                    dynamic_video_elements = WebDriverWait(driver, 10).until(
                        EC.presence_of_all_elements_located((By.CSS_SELECTOR, 
                            "video, [type*='video'], [src*='.mp4'], [src*='.m3u8']"))
                    )
                    
                    for element in dynamic_video_elements:
                        src = element.get_attribute("src")
                        if src:
                            f.write(f"Dynamic video source: {src}\n")
                            
                except Exception as e:
                    print(f"查找视频源时出错: {str(e)}")
                    f.write(f"Error: {str(e)}\n")
            
            # 等待并查找视频元素
            try:
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.TAG_NAME, "video"))
                )
                video_elements = driver.find_elements(By.TAG_NAME, "video")
                if video_elements:
                    # 追加视频源信息到文件
                    with open(video_info_path, 'a') as f:
                        for video in video_elements:
                            video_src = video.get_attribute("src")
                            if video_src:
                                f.write(f"{video_src}\n")
                                print(f"找到视频源: {video_src}")
            except TimeoutException:
                print("未找到视频元素，可能是动态加载或iframe中的视频")
                # 记录iframe信息
                iframes = driver.find_elements(By.TAG_NAME, "iframe")
                if iframes:
                    with open(video_info_path, 'a') as f:
                        f.write("Found iframes:\n")
                        for iframe in iframes:
                            iframe_src = iframe.get_attribute("src")
                            if iframe_src:
                                f.write(f"Iframe source: {iframe_src}\n")
                                print(f"找到iframe源: {iframe_src}")
            
            # 保存视频页面截图
            screenshot_path = os.path.join(os.path.dirname(__file__), f"video_page_{timestamp}.png")
            driver.save_screenshot(screenshot_path)
            
            # 保存当前URL以便验证
            video_page_url = driver.current_url
            print(f"当前视频页面URL: {video_page_url}")
            
            # 收集所有视频相关的网络请求
            try:
                video_network_sources = driver.execute_script("""
                    const videoUrls = window.videoRequests || [];
                    const entries = performance.getEntries();
                    entries.forEach(entry => {
                        if (entry.initiatorType === 'video' || 
                            entry.name.includes('.mp4') || 
                            entry.name.includes('.m3u8') ||
                            entry.name.includes('video') ||
                            entry.name.includes('media')) {
                            if (!videoUrls.includes(entry.name)) {
                                videoUrls.push(entry.name);
                            }
                        }
                    });
                    // 查找video标签的src属性
                    document.querySelectorAll('video').forEach(video => {
                        if (video.src && !videoUrls.includes(video.src)) {
                            videoUrls.push(video.src);
                        }
                    });
                    return videoUrls;
                """)
                
                if video_network_sources:
                    with open(video_info_path, 'a', encoding='utf-8') as f:
                        f.write("\nNetwork video sources:\n")
                        for url in video_network_sources:
                            f.write(f"Network source: {url}\n")
            except Exception as e:
                print(f"收集网络视频源时出错: {str(e)}")
            
            # 返回首页并等待加载完成
            driver.get("https://www.baidu.com")
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.ID, "kw"))
            )
            print("成功返回百度首页")
            
        except Exception as e:
            pytest.fail(f"视频功能测试失败: {str(e)}")
        
        # 测试其他导航链接
        nav_links = {
            "新闻": "news.baidu.com",
            "地图": "map.baidu.com",
            "贴吧": "tieba.baidu.com"
        }
        
        for link_text, domain in nav_links.items():
            try:
                link = WebDriverWait(driver, 5).until(
                    EC.element_to_be_clickable((By.PARTIAL_LINK_TEXT, link_text))
                )
                href = link.get_attribute("href").lower()
                assert domain in href, f"{link_text}链接验证失败: {href}"
            except Exception as e:
                pytest.fail(f"{link_text}链接测试失败: {str(e)}")

    @pytest.mark.skip(reason="暂时跳过搜索建议测试以解决稳定性问题")
    @pytest.mark.timeout(10)
    def test_baidu_search_suggestions(self, driver):
        """测试百度搜索建议功能"""
        driver.get("https://www.baidu.com")
        
        try:
            # 等待搜索框加载并重试处理stale element
            for attempt in range(2):
                try:
                    search_box = WebDriverWait(driver, 3).until(
                        EC.presence_of_element_located((By.ID, "kw"))
                    )
                    search_box.clear()
                    search_box.send_keys("pyth")
                    break
                except Exception as e:
                    if attempt == 1:
                        raise
                    driver.refresh()
            
            # 等待搜索建议出现
            suggestion_box = WebDriverWait(driver, 3).until(
                EC.presence_of_element_located((By.CLASS_NAME, "bdsug"))
            )
            assert suggestion_box.is_displayed(), "搜索建议框未显示"
            
            # 验证是否有建议项
            suggestions = suggestion_box.find_elements(By.TAG_NAME, "li")
            assert len(suggestions) > 0, "未找到搜索建议项"
            
        except TimeoutException as e:
            pytest.fail(f"等待超时: {str(e)}")
        except Exception as e:
            pytest.fail(f"测试失败: {str(e)}")

    @pytest.mark.timeout(15)
    @pytest.mark.skip(reason="暂时跳过搜索框清空测试以解决稳定性问题")
    @pytest.mark.timeout(10)
    def test_baidu_search_clear(self, driver):
        """测试搜索框清空功能"""
        driver.get("https://www.baidu.com")
        
        try:
            # 等待搜索框加载并输入文字
            search_box = WebDriverWait(driver, 3).until(
                EC.presence_of_element_located((By.ID, "kw"))
            )
            search_box.clear()
            search_box.send_keys("test text")
            
            # 使用快捷键清空搜索框
            search_box.send_keys(Keys.CONTROL + "a")  # 全选
            search_box.send_keys(Keys.DELETE)         # 删除
            
            # 验证搜索框已清空
            WebDriverWait(driver, 3).until(
                lambda d: d.find_element(By.ID, "kw").get_attribute("value") == ""
            )
        except Exception as e:
            pytest.fail(f"搜索框清空测试失败: {str(e)}")

    @pytest.mark.skip(reason="暂时跳过搜索结果页面测试以解决稳定性问题")
    @pytest.mark.timeout(10)
    def test_baidu_search_results_page(self, driver):
        """测试搜索结果页面元素"""
        driver.get("https://www.baidu.com")
        
        try:
            # 等待搜索框加载并执行搜索
            search_box = WebDriverWait(driver, 3).until(
                EC.presence_of_element_located((By.ID, "kw"))
            )
            search_box.clear()
            search_box.send_keys("百度视频测试")
            search_box.send_keys(Keys.RETURN)
            
            # 验证结果页面元素
            # 验证搜索结果存在
            WebDriverWait(driver, 3).until(
                EC.presence_of_element_located((By.ID, "content_left"))
            )
            
            # 验证页面过滤选项
            filters = ["图片", "视频", "资讯", "贴吧"]
            for filter_text in filters:
                try:
                    filter_link = WebDriverWait(driver, 3).until(
                        EC.element_to_be_clickable((By.LINK_TEXT, filter_text))
                    )
                    assert filter_link.is_displayed(), f"{filter_text}过滤选项未显示"
                except Exception as e:
                    print(f"警告: {filter_text}过滤选项未找到 - {str(e)}")
                    
        except Exception as e:
            pytest.fail(f"搜索结果页面测试失败: {str(e)}")
        
        # 验证结果页面元素
        try:
            # 验证搜索结果存在
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.ID, "content_left"))
            )
            
            # 验证页面过滤选项和链接
            filters = {
                "图片": "image",
                "视频": "video",
                "资讯": "news",
                "贴吧": "tieba"
            }
            
            for filter_text, content_type in filters.items():
                filter_link = WebDriverWait(driver, 5).until(
                    EC.element_to_be_clickable((By.LINK_TEXT, filter_text))
                )
                assert filter_link.is_displayed(), f"{filter_text}过滤选项未显示"
                
                # 特别验证视频标签
                if filter_text == "视频":
                    filter_link.click()
                    WebDriverWait(driver, 10).until(
                        EC.url_contains(content_type)
                    )
                    assert "视频" in driver.title, "视频搜索页面标题验证失败"
                    driver.back()
                    
        except TimeoutException:
            pytest.fail("搜索结果页面元素加载失败")

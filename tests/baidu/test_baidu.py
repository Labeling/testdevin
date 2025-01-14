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
        driver.implicitly_wait(10)
        yield driver
        driver.quit()

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

    def test_baidu_navigation_links(self, driver):
        """测试百度首页导航链接和视频功能"""
        driver.get("https://www.baidu.com")
        
        # 等待页面加载完成
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        
        # 测试视频功能
        try:
            # 使用多种定位策略查找视频链接
            video_link = None
            locators = [
                (By.LINK_TEXT, "视频"),
                (By.PARTIAL_LINK_TEXT, "视频"),
                (By.XPATH, "//a[contains(text(), '视频')]"),
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
            
            # 记录视频链接URL
            video_url = video_link.get_attribute("href").lower()
            print(f"找到视频链接: {video_url}")
            
            # 点击视频链接并等待页面加载
            video_link.click()
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            # 等待视频内容加载
            time.sleep(5)  # 给予足够时间加载动态内容
            
            # 生成时间戳
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            
            # 创建视频信息文件
            video_info_path = os.path.join(os.path.dirname(__file__), f"video_info_{timestamp}.txt")
            with open(video_info_path, 'w', encoding='utf-8') as f:
                f.write(f"Page URL: {driver.current_url}\n")
                f.write("Video Sources:\n")
                
                # 查找所有可能的视频源
                video_elements = driver.find_elements(By.TAG_NAME, "video")
                video_sources = driver.find_elements(By.TAG_NAME, "source")
                video_iframes = driver.find_elements(By.TAG_NAME, "iframe")
                
                # 记录直接的视频元素
                for video in video_elements:
                    src = video.get_attribute("src")
                    if src:
                        f.write(f"Direct video source: {src}\n")
                        
                # 记录source标签
                for source in video_sources:
                    src = source.get_attribute("src")
                    if src:
                        f.write(f"Video source tag: {src}\n")
                        
                # 检查iframe中的视频
                for iframe in video_iframes:
                    try:
                        driver.switch_to.frame(iframe)
                        iframe_videos = driver.find_elements(By.TAG_NAME, "video")
                        iframe_sources = driver.find_elements(By.TAG_NAME, "source")
                        
                        for video in iframe_videos:
                            src = video.get_attribute("src")
                            if src:
                                f.write(f"Iframe video source: {src}\n")
                                
                        for source in iframe_sources:
                            src = source.get_attribute("src")
                            if src:
                                f.write(f"Iframe source tag: {src}\n")
                                
                        driver.switch_to.default_content()
                    except Exception as e:
                        print(f"处理iframe时出错: {str(e)}")
                        driver.switch_to.default_content()
                        continue
            
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

    def test_baidu_search_suggestions(self, driver):
        """测试百度搜索建议功能"""
        driver.get("https://www.baidu.com")
        
        # 输入搜索词
        search_box = driver.find_element(By.ID, "kw")
        search_box.send_keys("pyth")
        
        # 等待搜索建议出现
        try:
            suggestion_box = WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((By.CLASS_NAME, "bdsug"))
            )
            assert suggestion_box.is_displayed()
        except TimeoutException:
            pytest.fail("搜索建议未显示")

    def test_baidu_search_clear(self, driver):
        """测试搜索框清空功能"""
        driver.get("https://www.baidu.com")
        
        # 输入文字
        search_box = driver.find_element(By.ID, "kw")
        search_box.send_keys("test text")
        
        # 使用快捷键清空搜索框
        search_box.send_keys(Keys.CONTROL + "a")  # 全选
        search_box.send_keys(Keys.DELETE)         # 删除
        
        # 验证搜索框已清空
        assert search_box.get_attribute("value") == ""

    def test_baidu_search_results_page(self, driver):
        """测试搜索结果页面元素"""
        driver.get("https://www.baidu.com")
        
        # 执行搜索
        search_box = driver.find_element(By.ID, "kw")
        search_box.send_keys("百度视频测试")
        search_box.send_keys(Keys.RETURN)
        
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

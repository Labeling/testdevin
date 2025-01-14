# 百度网页自动化测试用例

本项目包含了针对百度网页(www.baidu.com)的全面自动化测试用例。

## 测试用例清单

1. 基本搜索功能测试 (test_baidu_search_basic)
   - 访问百度首页
   - 验证页面标题
   - 输入搜索关键词
   - 点击搜索按钮
   - 验证搜索结果

2. 导航链接测试 (test_baidu_navigation_links)
   - 验证新闻链接
   - 验证地图链接
   - 验证视频链接
   - 验证贴吧链接

3. 搜索建议功能测试 (test_baidu_search_suggestions)
   - 输入部分搜索词
   - 验证搜索建议框显示
   - 验证搜索建议内容

4. 搜索框清空功能测试 (test_baidu_search_clear)
   - 输入搜索文本
   - 测试清空按钮功能
   - 验证搜索框已清空

5. 搜索结果页面测试 (test_baidu_search_results_page)
   - 执行搜索操作
   - 验证搜索结果存在
   - 验证页面过滤选项
   - 验证结果页面布局

## 环境要求

- Python 3.12+
- Chrome浏览器
- ChromeDriver

## 安装步骤

1. 创建虚拟环境：
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   # 或
   .\venv\Scripts\activate  # Windows
   ```

2. 安装依赖：
   ```bash
   pip install -r requirements.txt
   ```

## 执行测试

运行所有测试：
```bash
pytest test_baidu.py -v
```

生成HTML报告：
```bash
pytest test_baidu.py --html=report.html
```

## 注意事项

- 确保Chrome浏览器已安装
- 确保网络连接正常
- 测试执行时会启动无头模式的Chrome浏览器
- 每个测试用例都有10秒的隐式等待时间

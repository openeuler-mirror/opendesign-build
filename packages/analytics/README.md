# analytics for open-design

# 0.0.1

1. 内部采集事件支持 PV 数据，事件名：OpenEventKeys.PV

# 0.0.2

1. 内部采集事件支持性能数据。事件名：OpenEventKeys.PageBasePerformance\OpenEventKeys.LCP\OpenEventKeys.INP

# 0.0.3

1. 基础性能数据增加网络信息

# 0.0.4

1. 新增内部事件：PageClick 页面点击事件；可用于热力图分析；
2. client 信息默认不提供，通过插件函数方式配置；
3. report 接口参数 event 不能为空；

# 0.0.5

1. 事件数据字段从 data 更改为 properties；
2. 修复导入时自运行 storage，导致服务端渲染报错问题；

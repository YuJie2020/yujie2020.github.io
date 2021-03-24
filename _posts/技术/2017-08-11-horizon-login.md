---
layout: post
title: Horizon笔记--第一次登录流程详解
description: Horizon笔记--第一次登录流程详解
category: 技术
---

版本：Pike

虽然参与 OpenStack 开发这么久，对大部分的核心模块的源码都比较熟悉，但就有那么几个 project，我一直没有勇气花费时间精力理解源码，比如 Keystone，比如 Swift，再比如 Horizon，很大一部分原因可能是因为这几个 project 的代码结果跟大部分的 core project 相差太大（因为 openstack 诞生时只有 nova、swift，后续很多 project 都走了 nova 的路线）。

前段时间，因为公司的公有云中基于 Swift 的对象存储在多 region 部署下有个挺烦人的404问题需要修复，我就自告奋勇的接手了这个工作并尝试理解 Swift 的源码，并最终修复了这个困扰我们已久的 bug，也算是对 Swift 项目有了一个比较粗浅的认识。

Horizon 有些偏前端（准确的说是前端交互+后端逻辑），我之前对前端一无所知（除了在本科时看过一点 js 教程），所以对于 horizon 的代码理解停留在只能看懂 horizon 跟其他 openstack 服务的交互逻辑。但对于公有云来说，界面是跟用户交互的至关重要的一个环节，如果界面有什么问题，会直接影响用户的云上体验，而且任何服务的上线基本都会跟界面打交道。可以说，没有界面的服务对于公有云来说根本不能算是一个服务。加上最近在微博上看到 Angular 和 Vue 两大阵营吵得不可开交，我也很好奇为啥前端撕逼事件层出不穷。

最终，我决定学学前端，并且从 Horizon 开始。

网上对于 Horizon 的学习资料很少，Horizon 的官方开发者文档讲的也很浅显。作为初学者，抛开语言以及以及一些框架（比如 Django）的学习，我最想知道的就是从用户打开 horizon 登录界面，是如何一步一步创建出一个虚拟机的。作为学习笔记，本篇博客会详细讲解每一个步骤。

## Horizon 代码架构

Horizon项目代码结构主要分为两个部分：horizon和openstack_dashboard。horizon提供库和功能组件，openstack_dashboard是一个使用了horizon的Django项目。

`openstack_dashboard/setting.py`是 Django 的配置  
`openstack_dashboard/local/local_settings.py`，是horizon作为openstack组件的配置文件，比如配置 keystone 的服务地址。

## 登录过程详解

当用户点击一个 Horizon 页面时，如何根据 URL 找对应的处理代码呢？Django 的官方文档里有一个比较好的[解释](https://docs.djangoproject.com/en/1.11/topics/http/urls/#how-django-processes-a-request)，在openstack_dashboard默认配置中有：

```
ROOT_URLCONF = 'openstack_dashboard.urls'
```

一切就从这里开始。

### 疑惑

其实刚开始看代码的时候我有个疑惑，因为按照我的理解，访问 horizon 根路径时，按照 url 的配置：

```
urlpatterns = [
    url(r'^$', views.splash, name='splash'),
    url(r'^api/', include(rest.urls)),
    url(r'', include(horizon.urls)),
]

for u in getattr(settings, 'AUTHENTICATION_URLS', ['openstack_auth.urls']):
    urlpatterns.append(url(r'^auth/', include(u)))
```

应该是由views.splash方法处理，而在该方法开头就有：

```
@django.views.decorators.vary.vary_on_cookie
def splash(request):
    if not request.user.is_authenticated():
        raise exceptions.NotAuthenticated()
```

对于第一次登陆 horizon，用户当然是没有认证的，这里直接抛了异常，页面岂不是直接访问失败么？但实际登录 horizon 大家都知道会出现登录界面让输入用户名和密码，这个界面从哪儿来呢？从horizon 的日志中我看到了一些端倪：

```
[14/Aug/2017 23:35:21] "GET / HTTP/1.1" 302 0
[14/Aug/2017 23:35:26] "GET /auth/login/?next=/ HTTP/1.1" 200 9468
```

日志告诉我，horizon 先给浏览器返回302（重定向），将浏览器重定向到`/auth/login/?next=/`，我猜测登录界面应该是在这个时候出现的。但这个重定向是在哪里定义的呢？

### Django Middleware

看了半天 horizon 代码无解（我对 Django 也是一知半解），于是咨询了一个研究过 horizon 的朋友，我得到了答案。原来是[Django中的Middleware机制](https://docs.djangoproject.com/en/1.11/ref/middleware/)处理了那个`exceptions.NotAuthenticated`异常并且把页面重定向到登录认证。在openstack_dashboard的 django 配置中有如下定义：

```
MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'horizon.middleware.OperationLogMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'horizon.middleware.HorizonMiddleware',
    'horizon.themes.ThemeMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'openstack_dashboard.contrib.developer.profiler.middleware.'
    'ProfilerClientMiddleware',
    'openstack_dashboard.contrib.developer.profiler.middleware.'
    'ProfilerMiddleware',
)
```

其中，以 django 开头的是 django 默认提供的 middleware，可以参考官方文档了解每个 middleware 的作用，其他的就是 horizon 提供的自定义 middleware，其中`horizon.middleware.HorizonMiddleware`里就是我们要找的。在其`process_exception`方法中捕获了NotAuthenticated异常：

```
    def process_exception(self, request, exception):
        if isinstance(exception, (exceptions.NotAuthorized,
                                  exceptions.NotAuthenticated)):
            auth_url = settings.LOGIN_URL
		   ......
            login_url = request.build_absolute_uri(auth_url)
            response = redirect_to_login(next_url, login_url=login_url,
                                         redirect_field_name=field_name)
            ......
            return response
```

通过方法名我们也可以看出来，这里做了重定向，页面 URL 指向`settings.LOGIN_URL`，默认配置是`/auth/login/`，与 horizon 的日志吻合。接下来就是用户的登录认证。

### 登录认证

根据 URLconf 的定义，`/auth/login/`的处理在openstack_auth.urls模块中。

openstack_auth.urls模块其实是自定义了 Django 中的用户认证流程，按照[官方文档](https://docs.djangoproject.com/en/1.11/topics/auth/default/#module-django.contrib.auth.views)的介绍，openstack_auth.urls模块自定义了Authentication Views，使用自定义模板auth/login.html，以及自定义 Form。Django 中模板的查找过程：在每个 app 的 templates 文件夹中找（而不只是当前 app 中的代码只在当前的 app 的 templates 文件夹中找），所以，auth/login.html 模板并不一定在openstack_auth.urls模块中，而是在 horizon 子目录的 templates 目录中。

> 这里有一篇[博客](https://simpleisbetterthancomplex.com/tutorial/2016/06/27/how-to-use-djangos-built-in-login-system.html)简单的介绍了如何自定义 Django 的 login 界面

模板就是负责Form的展示和处理，这里的 Form 继承自[AuthenticationForm](https://docs.djangoproject.com/en/1.11/topics/auth/default/#django.contrib.auth.forms.AuthenticationForm)，有一个 clean 方法完成用户认证。对于 clean 方法，Django 官方文档中有解释：

> The form subclass’s `clean()` method can perform validation that requires access to multiple form fields. This is where you might put in checks such as “if field `A` is supplied, field `B` must contain a valid email address”. This method can return a completely different dictionary if it wishes, which will be used as the `cleaned_data`.

在 clean 方法中会调用`django.contrib.auth.authenticate`方法，根据文档，该方法会找到配置文件中的`AUTHENTICATION_BACKENDS`并调用其 authenticate方法，在openstack_dashboard的 django 配置中有

```
AUTHENTICATION_BACKENDS = ('openstack_auth.backend.KeystoneBackend',)
```

同时，会将 request 对象作为参数传递，认证成功后会设置 request.user，request.session 以及 request._keystoneclient 缓存以便访问 Keystone。

在认证时，会先根据用户的 credential 获取一个 unscoped_token，进而用户所属的所有 tenants，如果是第一次登陆 horizon，会找到第一个 tenant 登陆 horizon。这也就是为什么一般在登陆 horizon 时总是会看到类似如下的日志：

```
RESP BODY: {"tenants_links": [], "tenants": [{"description": "Openstack development tenant", "enabled": true, "id": "111a5e41d1af4c20974bf58b4dff8e5a", "name": "openstack-dev"}]}
```

认证成功后，根据`/auth/login/?next=/`，网页会再次跳转到根目录，但与第一次不同的是，这次用户已经是经过认证的。

我在实际测试时总是碰到循环登录的问题，就是说虽然我输入了正确的用户名和密码，但 horizon 还是跳转到登录界面，通过如下配置解决（需要安装 memcached）：

```
SESSION_ENGINE='django.contrib.sessions.backends.cache'
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.memcached.MemcachedCache',
        'LOCATION': '127.0.0.1:11211',
    }
}
```

### 进入 Dashboard

Horizon 会根据配置，找到一个 dashboard 并获取其 URL并跳转。这里就要提到 Horizon 官方文档中介绍的 dashboard 和 panel 的插件式注册机制。

首先，在openstack_dashboard的 django 配置中会获取所有的 dashboard 和 panel：

```
INSTALLED_APPS = list(INSTALLED_APPS)  # Make sure it's mutable
settings_utils.update_dashboards(
    [
        openstack_dashboard.enabled,
        openstack_dashboard.local.enabled,
    ],
    HORIZON_CONFIG,
    INSTALLED_APPS,
)
INSTALLED_APPS[0:0] = ADD_INSTALLED_APPS
```

在实际环境中，horizon 默认支持的 dashboard 和 panel 的配置文件都在`openstack_dashboard.enabled`，而以插件形式提供的 dashboard 和 panel 的配置文件都在`openstack_dashboard.local.enabled`，如果你有需求自己实现一个 dashboard 或 panel 与 horizon 集成，就是属于后者。

同时，这一步也会根据各个配置文件中`ADD_INSTALLED_APPS`动态添加 Django 应用，horizon 默认支持的几个 app：

```
ADD_INSTALLED_APPS = ['openstack_dashboard.dashboards.project']
ADD_INSTALLED_APPS = ['openstack_dashboard.dashboards.admin',]
ADD_INSTALLED_APPS = ['openstack_dashboard.dashboards.identity']
ADD_INSTALLED_APPS = ['openstack_dashboard.dashboards.settings',]
```

但这些 app 在哪里被加载呢？

这就要回到最开始加载 URL 映射的地方了：

```
url(r'', include(horizon.urls)),
```

如果一路跟下去，可以看到`horizon.base.Site`这个类的如下代码中，正式加载各个 dashboard 和 panel：

```
        for mod_name in ('dashboard', 'panel'):
            for app in settings.INSTALLED_APPS:
                mod = import_module(app)
                try:
                    before_import_registry = copy.copy(self._registry)
                    import_module('%s.%s' % (app, mod_name))
                except Exception:
                    self._registry = before_import_registry
                    if module_has_submodule(mod, mod_name):
                        raise
```

比如在identity这个 dashboard 中，会调用`horizon.register(Identity)`向 horizon 注册自己。Panel 的注册也是在`horizon.base.Site`类的`_process_panel_configuration`方法中：

```
elif config.get('ADD_PANEL', None):
    # Add the panel to the dashboard
    panel_path = config['ADD_PANEL']
    mod_path, panel_cls = panel_path.rsplit(".", 1)
    try:
        mod = import_module(mod_path)
    except ImportError:
        LOG.warning("Could not load panel: %s", mod_path)
        return
    panel = getattr(mod, panel_cls)
    # test is can_register method is present and call method if
    # it is to determine if the panel should be loaded
    if hasattr(panel, 'can_register') and \
       callable(getattr(panel, 'can_register')):
        if not panel.can_register():
            LOG.debug("Load condition failed for panel: %(panel)s",
                      {'panel': panel_slug})
            return
    dashboard_cls.register(panel)
    if panel_group:
        dashboard_cls.get_panel_group(panel_group).\
            panels.append(panel.slug)
    else:
        panels = list(dashboard_cls.panels)
        panels.append(panel)
        dashboard_cls.panels = tuple(panels)
```

现在，有了 URL 和处理方法的映射，用户登录成功后回到哪个页面呢？这里会用到 Django 配置中的`user_home`，默认是`openstack_dashboard.views.get_user_home`，horizon 会加载默认的 dashboard（注册的 dashboard 的第一个， 也就是 project app 的 overview panel）

至此，第一次登录流程就结束了。


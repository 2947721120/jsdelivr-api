# 公众的CDN API

Root: `/v1/<cdn>/libraries`

Supports `jsdelivr`, `google`, `cdnjs`, and `bootstrap`.

只有GET请求是允许的。不设置限制。

获取JSON格式的所有托管库

```
http://api.jsdelivr.com/v1/jsdelivr/libraries
http://api.jsdelivr.com/v1/google/libraries
http://api.jsdelivr.com/v1/cdnjs/libraries
http://api.jsdelivr.com/v1/bootstrap/libraries
```


获取充分信息的基础上单个库 `name` parameter.

```
http://api.jsdelivr.com/v1/jsdelivr/libraries?name=jquery
http://api.jsdelivr.com/v1/jsdelivr/libraries/jquery - alias
```

获取充分的信息来启动与 `jq` that has lastversion ending with `0.1`. [minimatch](https://www.npmjs.org/package/minimatch) syntax is supported.

```
http://api.jsdelivr.com/v1/jsdelivr/libraries?name=jq*&lastversion=*.0.1
```

您可以使用下列任何一种参数来搜索库。搜索将为您输入的项目进行搜索。可以同时使用多个参数。如果多个项目的比赛，他们都将输出。

* `name` - 库的名称。jQuery的例子：
* `mainfile` - 在info.ini主要的工艺文件参数。例如：jquery.min.js
* `lastversion`- 该项目lastversion。例如：第2.0.3条（将多个项目）
* `versions` -  选定项目的所有托管版本。（只读）
* `description` - 项目说明
* `homepage`- 网页上的项目。例子：http://jquery.com/
* `github`- GitHub页面项目。例子: https://github.com/jquery/jquery
* `author` - 项目作者。例子: jQuery Foundation
* `assets` - 每版本的文件. (read only)


可以将上述参数与参数组合起来 `fields`. 这样你可以控制输出。例如，得到的 `mainfile` jQuery你运行以下要求。

```
http://api.jsdelivr.com/v1/jsdelivr/libraries?name=jquery&fields=mainfile
```


可以用逗号分隔多个字段，用于分离。

```
http://api.jsdelivr.com/v1/jsdelivr/libraries?name=jquery&fields=mainfile,name
```

获得托管每个版本的文件的jQuery
```
http://api.jsdelivr.com/v1/jsdelivr/libraries?name=jquery&fields=assets
```

得到承载的文件为一个选择的版本
```
http://api.jsdelivr.com/v1/jsdelivr/libraries/jquery/2.0.3
```

将库匹配到任何查询的任何部分（默认值为 `and`)
```
http://api.jsdelivr.com/v1/jsdelivr/libraries?name=jquery&op=or
```

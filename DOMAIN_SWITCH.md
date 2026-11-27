# Переключение arlen-potolki на ar-len.ru

Статус: домен у клиента есть, пакет «Стандарт». CNAME-файл в репозитории НЕ добавлен, адреса в canonical, og:url, sitemap, robots и JSON-LD пока на murzzsite.github.io/arlen-potolki (сайт работает). Переключать только после DNS.

## 1. DNS у reg.ru (делает человек)
A-записи для @ (ar-len.ru):
- 185.199.108.153
- 185.199.109.153
- 185.199.110.153
- 185.199.111.153

CNAME для www: murzzsite.github.io (с точкой на конце, если панель требует). Старые A/AAAA и парковочные записи @ удалить. Проверка: `nslookup ar-len.ru` показывает 4 адреса выше.

## 2. Подключить домен в GitHub Pages (когда DNS появился)
```bash
gh api -X PUT repos/murzzsite/arlen-potolki/pages -f cname=ar-len.ru
```
Дождаться сертификата (до ~15 минут, иногда до часа), затем:
```bash
gh api repos/murzzsite/arlen-potolki/pages --jq '{cname,https_enforced,status}'
gh api -X PUT repos/murzzsite/arlen-potolki/pages -F https_enforced=true
```
Если по https отдаётся *.github.io: снять и вернуть cname (см. память reference_github_pages_https_reissue).

## 3. Заменить адреса в репозитории (одним коммитом после п. 2)
Заменить `https://murzzsite.github.io/arlen-potolki/` на `https://ar-len.ru/` в:
- index.html: canonical, og:url, og:image (если абсолютный), JSON-LD (url, @id, logo, image)
- privacy.html: canonical
- sitemap.xml: loc (privacy.html тоже, если есть)
- robots.txt: строка Sitemap
```bash
sed -i 's#https://murzzsite.github.io/arlen-potolki/#https://ar-len.ru/#g' index.html privacy.html sitemap.xml robots.txt
```
GitHub создаст файл CNAME сам при шаге 2; если нет, добавить `CNAME` со строкой `ar-len.ru`.

## 4. После переключения
- curl -sI https://ar-len.ru и https://www.ar-len.ru: 200 (www отдаёт редирект на apex)
- Яндекс.Вебмастер: добавить ar-len.ru, sitemap https://ar-len.ru/sitemap.xml, региональность Москва
- Яндекс.Метрика: поменять адрес сайта в счётчике, если счётчик есть
- Старый адрес github.io начнёт редиректить на домен сам

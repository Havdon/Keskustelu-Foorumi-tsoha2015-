# Keskustelu-Foorumi-tsoha2015-
Nodejs discusion forum writen for the Database Project course at Helsinki University (2015)


Aihe: Keskustelufoorumi (http://advancedkittenry.github.io/suunnittelu_ja_tyoymparisto/aiheet/Keskustelufoorumi.html)

Dokumentaatio: https://github.com/Havdon/Keskustelu-Foorumi-tsoha2015-/raw/master/doc/KeskustelufoorumiDokumentaatio.pdf

### HUOM: 

Testi datassa on kaksi käyttäjää:

> username: admin
>
> password: password

> username: billy
>
> password: password

### Pari sivua (muitakin on):

[Etusivu]

[Alifoorumi]

[Säije (thread)](http://koli.io/tsoha/f/0/t/00)

[Login sivu]

[Rekisteröinti sivu]

### SQL tiedostot

https://github.com/Havdon/Keskustelu-Foorumi-tsoha2015-/tree/master/src/sql

[etusivu]:http://koli.io/tsoha/
[Alifoorumi]:http://koli.io/tsoha/f/0
[Login sivu]: http://koli.io/tsoha/auth
[Rekisteröinti sivu]: http://koli.io/tsoha/auth/register


### Pari malliluokka:

[Säije (thread)](https://github.com/Havdon/Keskustelu-Foorumi-tsoha2015-/blob/master/src/models/Thread.model.js)

[Alifoorumi](https://github.com/Havdon/Keskustelu-Foorumi-tsoha2015-/blob/master/src/models/Subforum.model.js)

[Käyttäjä](https://github.com/Havdon/Keskustelu-Foorumi-tsoha2015-/blob/master/src/models/User.model.js)


### Pari kontrolleria jotka käyttävät malliluokkia hyväkseen:

[Säjie (thread)](https://github.com/Havdon/Keskustelu-Foorumi-tsoha2015-/blob/master/src/controllers/post/post.js)

[Alifoorumi](https://github.com/Havdon/Keskustelu-Foorumi-tsoha2015-/blob/master/src/controllers/subforum/subforum.js)

[Käyttäjä](https://github.com/Havdon/Keskustelu-Foorumi-tsoha2015-/blob/master/src/controllers/user/user.js)

[Auth](https://github.com/Havdon/Keskustelu-Foorumi-tsoha2015-/blob/master/src/controllers/auth/auth.js)

### Esimerkki lomakkeella uuden käyttäjän luominen:

[Rekisteröinti sivu]

[Auth kontrolleri](https://github.com/Havdon/Keskustelu-Foorumi-tsoha2015-/blob/master/src/controllers/auth/auth.js)

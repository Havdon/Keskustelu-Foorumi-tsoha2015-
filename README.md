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

[Kirjaus (post)](https://github.com/Havdon/Keskustelu-Foorumi-tsoha2015-/blob/master/src/controllers/post/post.js)

[Alifoorumi](https://github.com/Havdon/Keskustelu-Foorumi-tsoha2015-/blob/master/src/controllers/subforum/subforum.js)

[Käyttäjä](https://github.com/Havdon/Keskustelu-Foorumi-tsoha2015-/blob/master/src/controllers/user/user.js)

[Auth](https://github.com/Havdon/Keskustelu-Foorumi-tsoha2015-/blob/master/src/controllers/auth/auth.js)

### Esimerkki lomakkeella uuden käyttäjän luominen:

[Rekisteröinti sivu]

[Auth kontrolleri](https://github.com/Havdon/Keskustelu-Foorumi-tsoha2015-/blob/master/src/controllers/auth/auth.js)

### Viikko 4 palautus:
Käyttäjä voi postaa luomansa kirjauksen säikeestä painamalla "Delete" nappia kirjauksen oikeassa yläkulmassa.
Kontrolleri käyttää Post.destroy funktiota kirjauksen poistossa.

[Kirjaus kontrolleri](https://github.com/Havdon/Keskustelu-Foorumi-tsoha2015-/blob/master/src/controllers/post/post.js)

[Kirjaus malli](https://github.com/Havdon/Keskustelu-Foorumi-tsoha2015-/blob/master/src/models/Post.model.js)

Käyttäjä voi muokata luomaansa säijettä painamalla "Edit" nappia säikeen oikeassa yläkulmassa.
Säikeen kontrolleri käyttää Thread.update funktiota säijkeen muokkaamisessa. Säikeen voi muokata niin että siinä on tyhjä pääteksti (body), muttei niin että siinä on tyhjä otsikko. Jos otsikko on tyhjä, näytetään käyttäjälle virhe viesti.

[Säikeen kontrolleri](https://github.com/Havdon/Keskustelu-Foorumi-tsoha2015-/blob/master/src/controllers/thread/thread.js)

[Säijkeen malli](https://github.com/Havdon/Keskustelu-Foorumi-tsoha2015-/blob/master/src/models/Thread.model.js)

Käyttäjän kirjautuminen implementoitiin jo pari viikkoa sitten. Tämän READMEN alussa voit nähdä pari esimerkki käyttäjää jolla voit kirjautua. Sisäänkirjautumis logiikan voi löytää [Auth kontrollerista](https://github.com/Havdon/Keskustelu-Foorumi-tsoha2015-/blob/master/src/controllers/auth/auth.js), tärkeimpänä "autheticate" funktio joka tarkistaa onko käyttäjänimi ja salasana oikein ja luo käyttäjälle session jos näin on. Lisäksi on olemassa [Auth utility olio](https://github.com/Havdon/Keskustelu-Foorumi-tsoha2015-/blob/master/src/auth.js), jossa tärkeimpänä funktiona Auth.require jolla voi estää käyttäjiä menemästä sivulle jos käyttäjä ei ole sisäänkirjautunut. Esim:
```javascript
this.post('/route/path', this.app.auth.require(), this.routePathFunction);
```

Auth kontrolleri käyttää [Käyttäjä mallia](https://github.com/Havdon/Keskustelu-Foorumi-tsoha2015-/blob/master/src/models/User.model.js)

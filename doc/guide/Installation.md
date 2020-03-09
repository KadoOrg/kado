# Installation
> NOTICE: Kado 3 is **DEPRECATED**, see [kado.org](https://kado.org) for the latest version.

Installation of Kado is simple as it relies on NPM, the Node.js core package
management system. However, before installing Kado, MySQL and Node.js must both
be available to the system. MySQL can be remote or local. For this guide we are
going to assume MySQL is desired locally.

## Requirement Versions

MySQL must be 5.7 or later and Node.JS must be 8.0 or later. Using the latest
versions is recommended for development and then using the LTS versions in
production.

## Linux

For Node.js see more
[installation documentation here](https://nodejs.org/en/download/package-manager/)

### Debian

Debian now uses MariaDB as the default SQL database server. It is your choice to
install the [community edition](https://dev.mysql.com/downloads/mysql/) or work
with MariaDB. They are both compatible.

```
$ apt-get install mariadb-server nodejs
```

### CentOS

```
$ yum install mysql nodejs npm --enablerepo=epel
```

## Windows

To use Kado on Windows two installers must be ran through if they are not
already present on the system.

First, [install MySQL](https://dev.mysql.com/downloads/mysql/)

Second, [install Node.JS](https://nodejs.org)

## Mac OS

To use Kado on Mac OS two installers must be ran through if they are not already
present on the system.

First,
[install MySQL](https://dev.mysql.com/doc/refman/5.7/en/osx-installation-pkg.html)

Second, [install Node.JS](https://nodejs.org/en/download/)

## BSD

BSD is not an officially supported operating system but we believe the tool
stack is definitely compatible.

First,
[install MySQL](https://dev.mysql.com/doc/refman/5.7/en/freebsd-installation.html)

Second,
[install Node.JS](https://nodejs.org/en/download/package-manager/#freebsd)

## Install Kado

Before running your application you need Kado in some form. Typically this is
done by creating a `package.json` by running `npm init` inside of your
application folder. It will ask for key application details and then generate a
`package.json` file for you.

Now Install Kado 3
```
npm install git+https://git.nullivex.com/kado/kado#3.x
```
Afterwards, Kado will be saved to your projects `package.json` and will be
installed any time `npm install` is ran within your project root.

Now your system is Kado ready! Check out the
[Getting Started](https://kado.org/doc/3.10.6/getting-started/) guide.
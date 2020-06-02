CREATE DATABASE racecourse;

USE racecourse;

CREATE TABLE classes (
    id int unsigned not null auto_increment,
    created timestamp default now(),
    modified timestamp default now() on update now() not null,
    name varchar(100) not null,
    start_date date,
    end_date date,
    constraint pk_classes primary key(id)
);

CREATE INDEX idx_class_start_date ON classes(start_date);
CREATE INDEX idx_class_end_date ON classes(end_date);

CREATE TABLE categories (
    id int unsigned not null auto_increment,
    created timestamp default now(),
    modified timestamp default now() on update now() not null,
    name varchar(100) not null,
    content text,
    display_order int unsigned not null,
    class_id int unsigned not null,
    constraint pk_categories primary key(id),
    constraint fk_categories_class_id foreign key (class_id) references classes(id)
);

CREATE INDEX idx_categories_class_id ON categories(class_id);
CREATE INDEX idx_categories_display_order ON categories(display_order);

CREATE TABLE users (
    id int unsigned not null auto_increment,
    created timestamp default now(),
    modified timestamp default now() on update now() not null,
    first varchar(100) not null,
    last varchar(100) not null,
    email varchar(255) not null,
    hash varchar(256) not null,
    salt varchar(128) not null,
    is_global_admin tinyint not null default 0,
    unique(email),
    constraint pk_users primary key(id)
);

CREATE TABLE classes_users (
    id int unsigned not null auto_increment,
    created timestamp default now(),
    modified timestamp default now() on update now() not null,
    is_admin tinyint not null default 0,
    user_id int unsigned not null,
    class_id int unsigned not null,
    unique(user_id,class_id),
    constraint pk_classes_users primary key(id),
    constraint fk_classes_users_user_id foreign key (user_id) references users(id),
    constraint fk_classes_users_class_id foreign key (class_id) references classes(id)
);

CREATE INDEX idx_classes_users_is_admin ON classes_users(is_admin);
CREATE INDEX idx_classes_users_user_id ON classes_users(user_id);
CREATE INDEX idx_classes_users_class_id ON classes_users(class_id);
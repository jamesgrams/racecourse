CREATE DATABASE racecourse;

USE racecourse;

CREATE TABLE classes (
    id int unsigned not null auto_increment,
    created timestamp default now(),
    modified timestamp default now() on update now() not null,
    name varchar(100) not null,
    constraint pk_classes primary key(id)
);

CREATE TABLE categories (
    id int unsigned not null auto_increment,
    created timestamp default now(),
    modified timestamp default now() on update now() not null,
    name varchar(100) not null,
    content text,
    display_order int unsigned not null,
    class_id int unsigned not null,
    constraint pk_categories primary key(id),
    constraint fk_categories_class_id foreign key (class_id) references classes(id) on delete cascade on update cascade
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
    constraint fk_classes_users_user_id foreign key (user_id) references users(id) on delete cascade on update cascade,
    constraint fk_classes_users_class_id foreign key (class_id) references classes(id) on delete cascade on update cascade
);

CREATE INDEX idx_classes_users_is_admin ON classes_users(is_admin);
CREATE INDEX idx_classes_users_user_id ON classes_users(user_id);
CREATE INDEX idx_classes_users_class_id ON classes_users(class_id);

CREATE TABLE meetings (
    id int unsigned not null auto_increment,
    created timestamp default now(),
    modified timestamp default now() on update now() not null,
    class_id int unsigned not null,
    start_date timestamp not null,
    end_date timestamp not null,
    constraint pk_meetings primary key(id),
    constraint fk_meetings_class_id foreign key (class_id) references classes(id) on delete cascade on update cascade
);

CREATE INDEX idx_meetings_class_id ON meetings(class_id);
CREATE INDEX idx_meetings_start_date ON meetings(start_date);
CREATE INDEX idx_meetings_end_date ON meetings(end_date);
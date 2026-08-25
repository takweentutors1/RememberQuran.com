// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'quran_db.dart';

// ignore_for_file: type=lint
class $ChaptersTable extends Chapters with TableInfo<$ChaptersTable, Chapter> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $ChaptersTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _revelationPlaceMeta = const VerificationMeta(
    'revelationPlace',
  );
  @override
  late final GeneratedColumn<String> revelationPlace = GeneratedColumn<String>(
    'revelation_place',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _revelationOrderMeta = const VerificationMeta(
    'revelationOrder',
  );
  @override
  late final GeneratedColumn<int> revelationOrder = GeneratedColumn<int>(
    'revelation_order',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _bismillahPreMeta = const VerificationMeta(
    'bismillahPre',
  );
  @override
  late final GeneratedColumn<bool> bismillahPre = GeneratedColumn<bool>(
    'bismillah_pre',
    aliasedName,
    false,
    type: DriftSqlType.bool,
    requiredDuringInsert: true,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'CHECK ("bismillah_pre" IN (0, 1))',
    ),
  );
  static const VerificationMeta _nameSimpleMeta = const VerificationMeta(
    'nameSimple',
  );
  @override
  late final GeneratedColumn<String> nameSimple = GeneratedColumn<String>(
    'name_simple',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _nameComplexMeta = const VerificationMeta(
    'nameComplex',
  );
  @override
  late final GeneratedColumn<String> nameComplex = GeneratedColumn<String>(
    'name_complex',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _nameArabicMeta = const VerificationMeta(
    'nameArabic',
  );
  @override
  late final GeneratedColumn<String> nameArabic = GeneratedColumn<String>(
    'name_arabic',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _versesCountMeta = const VerificationMeta(
    'versesCount',
  );
  @override
  late final GeneratedColumn<int> versesCount = GeneratedColumn<int>(
    'verses_count',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _pagesMeta = const VerificationMeta('pages');
  @override
  late final GeneratedColumn<String> pages = GeneratedColumn<String>(
    'pages',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _translatedNameMeta = const VerificationMeta(
    'translatedName',
  );
  @override
  late final GeneratedColumn<String> translatedName = GeneratedColumn<String>(
    'translated_name',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    revelationPlace,
    revelationOrder,
    bismillahPre,
    nameSimple,
    nameComplex,
    nameArabic,
    versesCount,
    pages,
    translatedName,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'chapters';
  @override
  VerificationContext validateIntegrity(
    Insertable<Chapter> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('revelation_place')) {
      context.handle(
        _revelationPlaceMeta,
        revelationPlace.isAcceptableOrUnknown(
          data['revelation_place']!,
          _revelationPlaceMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_revelationPlaceMeta);
    }
    if (data.containsKey('revelation_order')) {
      context.handle(
        _revelationOrderMeta,
        revelationOrder.isAcceptableOrUnknown(
          data['revelation_order']!,
          _revelationOrderMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_revelationOrderMeta);
    }
    if (data.containsKey('bismillah_pre')) {
      context.handle(
        _bismillahPreMeta,
        bismillahPre.isAcceptableOrUnknown(
          data['bismillah_pre']!,
          _bismillahPreMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_bismillahPreMeta);
    }
    if (data.containsKey('name_simple')) {
      context.handle(
        _nameSimpleMeta,
        nameSimple.isAcceptableOrUnknown(data['name_simple']!, _nameSimpleMeta),
      );
    } else if (isInserting) {
      context.missing(_nameSimpleMeta);
    }
    if (data.containsKey('name_complex')) {
      context.handle(
        _nameComplexMeta,
        nameComplex.isAcceptableOrUnknown(
          data['name_complex']!,
          _nameComplexMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_nameComplexMeta);
    }
    if (data.containsKey('name_arabic')) {
      context.handle(
        _nameArabicMeta,
        nameArabic.isAcceptableOrUnknown(data['name_arabic']!, _nameArabicMeta),
      );
    } else if (isInserting) {
      context.missing(_nameArabicMeta);
    }
    if (data.containsKey('verses_count')) {
      context.handle(
        _versesCountMeta,
        versesCount.isAcceptableOrUnknown(
          data['verses_count']!,
          _versesCountMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_versesCountMeta);
    }
    if (data.containsKey('pages')) {
      context.handle(
        _pagesMeta,
        pages.isAcceptableOrUnknown(data['pages']!, _pagesMeta),
      );
    } else if (isInserting) {
      context.missing(_pagesMeta);
    }
    if (data.containsKey('translated_name')) {
      context.handle(
        _translatedNameMeta,
        translatedName.isAcceptableOrUnknown(
          data['translated_name']!,
          _translatedNameMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_translatedNameMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  Chapter map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return Chapter(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}id'],
      )!,
      revelationPlace: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}revelation_place'],
      )!,
      revelationOrder: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}revelation_order'],
      )!,
      bismillahPre: attachedDatabase.typeMapping.read(
        DriftSqlType.bool,
        data['${effectivePrefix}bismillah_pre'],
      )!,
      nameSimple: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}name_simple'],
      )!,
      nameComplex: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}name_complex'],
      )!,
      nameArabic: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}name_arabic'],
      )!,
      versesCount: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}verses_count'],
      )!,
      pages: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}pages'],
      )!,
      translatedName: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}translated_name'],
      )!,
    );
  }

  @override
  $ChaptersTable createAlias(String alias) {
    return $ChaptersTable(attachedDatabase, alias);
  }
}

class Chapter extends DataClass implements Insertable<Chapter> {
  final int id;
  final String revelationPlace;
  final int revelationOrder;
  final bool bismillahPre;
  final String nameSimple;
  final String nameComplex;
  final String nameArabic;
  final int versesCount;
  final String pages;
  final String translatedName;
  const Chapter({
    required this.id,
    required this.revelationPlace,
    required this.revelationOrder,
    required this.bismillahPre,
    required this.nameSimple,
    required this.nameComplex,
    required this.nameArabic,
    required this.versesCount,
    required this.pages,
    required this.translatedName,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['revelation_place'] = Variable<String>(revelationPlace);
    map['revelation_order'] = Variable<int>(revelationOrder);
    map['bismillah_pre'] = Variable<bool>(bismillahPre);
    map['name_simple'] = Variable<String>(nameSimple);
    map['name_complex'] = Variable<String>(nameComplex);
    map['name_arabic'] = Variable<String>(nameArabic);
    map['verses_count'] = Variable<int>(versesCount);
    map['pages'] = Variable<String>(pages);
    map['translated_name'] = Variable<String>(translatedName);
    return map;
  }

  ChaptersCompanion toCompanion(bool nullToAbsent) {
    return ChaptersCompanion(
      id: Value(id),
      revelationPlace: Value(revelationPlace),
      revelationOrder: Value(revelationOrder),
      bismillahPre: Value(bismillahPre),
      nameSimple: Value(nameSimple),
      nameComplex: Value(nameComplex),
      nameArabic: Value(nameArabic),
      versesCount: Value(versesCount),
      pages: Value(pages),
      translatedName: Value(translatedName),
    );
  }

  factory Chapter.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return Chapter(
      id: serializer.fromJson<int>(json['id']),
      revelationPlace: serializer.fromJson<String>(json['revelationPlace']),
      revelationOrder: serializer.fromJson<int>(json['revelationOrder']),
      bismillahPre: serializer.fromJson<bool>(json['bismillahPre']),
      nameSimple: serializer.fromJson<String>(json['nameSimple']),
      nameComplex: serializer.fromJson<String>(json['nameComplex']),
      nameArabic: serializer.fromJson<String>(json['nameArabic']),
      versesCount: serializer.fromJson<int>(json['versesCount']),
      pages: serializer.fromJson<String>(json['pages']),
      translatedName: serializer.fromJson<String>(json['translatedName']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'revelationPlace': serializer.toJson<String>(revelationPlace),
      'revelationOrder': serializer.toJson<int>(revelationOrder),
      'bismillahPre': serializer.toJson<bool>(bismillahPre),
      'nameSimple': serializer.toJson<String>(nameSimple),
      'nameComplex': serializer.toJson<String>(nameComplex),
      'nameArabic': serializer.toJson<String>(nameArabic),
      'versesCount': serializer.toJson<int>(versesCount),
      'pages': serializer.toJson<String>(pages),
      'translatedName': serializer.toJson<String>(translatedName),
    };
  }

  Chapter copyWith({
    int? id,
    String? revelationPlace,
    int? revelationOrder,
    bool? bismillahPre,
    String? nameSimple,
    String? nameComplex,
    String? nameArabic,
    int? versesCount,
    String? pages,
    String? translatedName,
  }) => Chapter(
    id: id ?? this.id,
    revelationPlace: revelationPlace ?? this.revelationPlace,
    revelationOrder: revelationOrder ?? this.revelationOrder,
    bismillahPre: bismillahPre ?? this.bismillahPre,
    nameSimple: nameSimple ?? this.nameSimple,
    nameComplex: nameComplex ?? this.nameComplex,
    nameArabic: nameArabic ?? this.nameArabic,
    versesCount: versesCount ?? this.versesCount,
    pages: pages ?? this.pages,
    translatedName: translatedName ?? this.translatedName,
  );
  Chapter copyWithCompanion(ChaptersCompanion data) {
    return Chapter(
      id: data.id.present ? data.id.value : this.id,
      revelationPlace: data.revelationPlace.present
          ? data.revelationPlace.value
          : this.revelationPlace,
      revelationOrder: data.revelationOrder.present
          ? data.revelationOrder.value
          : this.revelationOrder,
      bismillahPre: data.bismillahPre.present
          ? data.bismillahPre.value
          : this.bismillahPre,
      nameSimple: data.nameSimple.present
          ? data.nameSimple.value
          : this.nameSimple,
      nameComplex: data.nameComplex.present
          ? data.nameComplex.value
          : this.nameComplex,
      nameArabic: data.nameArabic.present
          ? data.nameArabic.value
          : this.nameArabic,
      versesCount: data.versesCount.present
          ? data.versesCount.value
          : this.versesCount,
      pages: data.pages.present ? data.pages.value : this.pages,
      translatedName: data.translatedName.present
          ? data.translatedName.value
          : this.translatedName,
    );
  }

  @override
  String toString() {
    return (StringBuffer('Chapter(')
          ..write('id: $id, ')
          ..write('revelationPlace: $revelationPlace, ')
          ..write('revelationOrder: $revelationOrder, ')
          ..write('bismillahPre: $bismillahPre, ')
          ..write('nameSimple: $nameSimple, ')
          ..write('nameComplex: $nameComplex, ')
          ..write('nameArabic: $nameArabic, ')
          ..write('versesCount: $versesCount, ')
          ..write('pages: $pages, ')
          ..write('translatedName: $translatedName')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
    id,
    revelationPlace,
    revelationOrder,
    bismillahPre,
    nameSimple,
    nameComplex,
    nameArabic,
    versesCount,
    pages,
    translatedName,
  );
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is Chapter &&
          other.id == this.id &&
          other.revelationPlace == this.revelationPlace &&
          other.revelationOrder == this.revelationOrder &&
          other.bismillahPre == this.bismillahPre &&
          other.nameSimple == this.nameSimple &&
          other.nameComplex == this.nameComplex &&
          other.nameArabic == this.nameArabic &&
          other.versesCount == this.versesCount &&
          other.pages == this.pages &&
          other.translatedName == this.translatedName);
}

class ChaptersCompanion extends UpdateCompanion<Chapter> {
  final Value<int> id;
  final Value<String> revelationPlace;
  final Value<int> revelationOrder;
  final Value<bool> bismillahPre;
  final Value<String> nameSimple;
  final Value<String> nameComplex;
  final Value<String> nameArabic;
  final Value<int> versesCount;
  final Value<String> pages;
  final Value<String> translatedName;
  const ChaptersCompanion({
    this.id = const Value.absent(),
    this.revelationPlace = const Value.absent(),
    this.revelationOrder = const Value.absent(),
    this.bismillahPre = const Value.absent(),
    this.nameSimple = const Value.absent(),
    this.nameComplex = const Value.absent(),
    this.nameArabic = const Value.absent(),
    this.versesCount = const Value.absent(),
    this.pages = const Value.absent(),
    this.translatedName = const Value.absent(),
  });
  ChaptersCompanion.insert({
    this.id = const Value.absent(),
    required String revelationPlace,
    required int revelationOrder,
    required bool bismillahPre,
    required String nameSimple,
    required String nameComplex,
    required String nameArabic,
    required int versesCount,
    required String pages,
    required String translatedName,
  }) : revelationPlace = Value(revelationPlace),
       revelationOrder = Value(revelationOrder),
       bismillahPre = Value(bismillahPre),
       nameSimple = Value(nameSimple),
       nameComplex = Value(nameComplex),
       nameArabic = Value(nameArabic),
       versesCount = Value(versesCount),
       pages = Value(pages),
       translatedName = Value(translatedName);
  static Insertable<Chapter> custom({
    Expression<int>? id,
    Expression<String>? revelationPlace,
    Expression<int>? revelationOrder,
    Expression<bool>? bismillahPre,
    Expression<String>? nameSimple,
    Expression<String>? nameComplex,
    Expression<String>? nameArabic,
    Expression<int>? versesCount,
    Expression<String>? pages,
    Expression<String>? translatedName,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (revelationPlace != null) 'revelation_place': revelationPlace,
      if (revelationOrder != null) 'revelation_order': revelationOrder,
      if (bismillahPre != null) 'bismillah_pre': bismillahPre,
      if (nameSimple != null) 'name_simple': nameSimple,
      if (nameComplex != null) 'name_complex': nameComplex,
      if (nameArabic != null) 'name_arabic': nameArabic,
      if (versesCount != null) 'verses_count': versesCount,
      if (pages != null) 'pages': pages,
      if (translatedName != null) 'translated_name': translatedName,
    });
  }

  ChaptersCompanion copyWith({
    Value<int>? id,
    Value<String>? revelationPlace,
    Value<int>? revelationOrder,
    Value<bool>? bismillahPre,
    Value<String>? nameSimple,
    Value<String>? nameComplex,
    Value<String>? nameArabic,
    Value<int>? versesCount,
    Value<String>? pages,
    Value<String>? translatedName,
  }) {
    return ChaptersCompanion(
      id: id ?? this.id,
      revelationPlace: revelationPlace ?? this.revelationPlace,
      revelationOrder: revelationOrder ?? this.revelationOrder,
      bismillahPre: bismillahPre ?? this.bismillahPre,
      nameSimple: nameSimple ?? this.nameSimple,
      nameComplex: nameComplex ?? this.nameComplex,
      nameArabic: nameArabic ?? this.nameArabic,
      versesCount: versesCount ?? this.versesCount,
      pages: pages ?? this.pages,
      translatedName: translatedName ?? this.translatedName,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (revelationPlace.present) {
      map['revelation_place'] = Variable<String>(revelationPlace.value);
    }
    if (revelationOrder.present) {
      map['revelation_order'] = Variable<int>(revelationOrder.value);
    }
    if (bismillahPre.present) {
      map['bismillah_pre'] = Variable<bool>(bismillahPre.value);
    }
    if (nameSimple.present) {
      map['name_simple'] = Variable<String>(nameSimple.value);
    }
    if (nameComplex.present) {
      map['name_complex'] = Variable<String>(nameComplex.value);
    }
    if (nameArabic.present) {
      map['name_arabic'] = Variable<String>(nameArabic.value);
    }
    if (versesCount.present) {
      map['verses_count'] = Variable<int>(versesCount.value);
    }
    if (pages.present) {
      map['pages'] = Variable<String>(pages.value);
    }
    if (translatedName.present) {
      map['translated_name'] = Variable<String>(translatedName.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('ChaptersCompanion(')
          ..write('id: $id, ')
          ..write('revelationPlace: $revelationPlace, ')
          ..write('revelationOrder: $revelationOrder, ')
          ..write('bismillahPre: $bismillahPre, ')
          ..write('nameSimple: $nameSimple, ')
          ..write('nameComplex: $nameComplex, ')
          ..write('nameArabic: $nameArabic, ')
          ..write('versesCount: $versesCount, ')
          ..write('pages: $pages, ')
          ..write('translatedName: $translatedName')
          ..write(')'))
        .toString();
  }
}

class $VersesTable extends Verses with TableInfo<$VersesTable, Verse> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $VersesTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _chapterIdMeta = const VerificationMeta(
    'chapterId',
  );
  @override
  late final GeneratedColumn<int> chapterId = GeneratedColumn<int>(
    'chapter_id',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'REFERENCES chapters (id)',
    ),
  );
  static const VerificationMeta _verseNumberMeta = const VerificationMeta(
    'verseNumber',
  );
  @override
  late final GeneratedColumn<int> verseNumber = GeneratedColumn<int>(
    'verse_number',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _verseKeyMeta = const VerificationMeta(
    'verseKey',
  );
  @override
  late final GeneratedColumn<String> verseKey = GeneratedColumn<String>(
    'verse_key',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _pageNumberMeta = const VerificationMeta(
    'pageNumber',
  );
  @override
  late final GeneratedColumn<int> pageNumber = GeneratedColumn<int>(
    'page_number',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _juzNumberMeta = const VerificationMeta(
    'juzNumber',
  );
  @override
  late final GeneratedColumn<int> juzNumber = GeneratedColumn<int>(
    'juz_number',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _hizbNumberMeta = const VerificationMeta(
    'hizbNumber',
  );
  @override
  late final GeneratedColumn<int> hizbNumber = GeneratedColumn<int>(
    'hizb_number',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _textUthmaniMeta = const VerificationMeta(
    'textUthmani',
  );
  @override
  late final GeneratedColumn<String> textUthmani = GeneratedColumn<String>(
    'text_uthmani',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _qpcUthmaniHafsMeta = const VerificationMeta(
    'qpcUthmaniHafs',
  );
  @override
  late final GeneratedColumn<String> qpcUthmaniHafs = GeneratedColumn<String>(
    'qpc_uthmani_hafs',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    chapterId,
    verseNumber,
    verseKey,
    pageNumber,
    juzNumber,
    hizbNumber,
    textUthmani,
    qpcUthmaniHafs,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'verses';
  @override
  VerificationContext validateIntegrity(
    Insertable<Verse> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('chapter_id')) {
      context.handle(
        _chapterIdMeta,
        chapterId.isAcceptableOrUnknown(data['chapter_id']!, _chapterIdMeta),
      );
    } else if (isInserting) {
      context.missing(_chapterIdMeta);
    }
    if (data.containsKey('verse_number')) {
      context.handle(
        _verseNumberMeta,
        verseNumber.isAcceptableOrUnknown(
          data['verse_number']!,
          _verseNumberMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_verseNumberMeta);
    }
    if (data.containsKey('verse_key')) {
      context.handle(
        _verseKeyMeta,
        verseKey.isAcceptableOrUnknown(data['verse_key']!, _verseKeyMeta),
      );
    } else if (isInserting) {
      context.missing(_verseKeyMeta);
    }
    if (data.containsKey('page_number')) {
      context.handle(
        _pageNumberMeta,
        pageNumber.isAcceptableOrUnknown(data['page_number']!, _pageNumberMeta),
      );
    } else if (isInserting) {
      context.missing(_pageNumberMeta);
    }
    if (data.containsKey('juz_number')) {
      context.handle(
        _juzNumberMeta,
        juzNumber.isAcceptableOrUnknown(data['juz_number']!, _juzNumberMeta),
      );
    } else if (isInserting) {
      context.missing(_juzNumberMeta);
    }
    if (data.containsKey('hizb_number')) {
      context.handle(
        _hizbNumberMeta,
        hizbNumber.isAcceptableOrUnknown(data['hizb_number']!, _hizbNumberMeta),
      );
    } else if (isInserting) {
      context.missing(_hizbNumberMeta);
    }
    if (data.containsKey('text_uthmani')) {
      context.handle(
        _textUthmaniMeta,
        textUthmani.isAcceptableOrUnknown(
          data['text_uthmani']!,
          _textUthmaniMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_textUthmaniMeta);
    }
    if (data.containsKey('qpc_uthmani_hafs')) {
      context.handle(
        _qpcUthmaniHafsMeta,
        qpcUthmaniHafs.isAcceptableOrUnknown(
          data['qpc_uthmani_hafs']!,
          _qpcUthmaniHafsMeta,
        ),
      );
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  Verse map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return Verse(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}id'],
      )!,
      chapterId: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}chapter_id'],
      )!,
      verseNumber: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}verse_number'],
      )!,
      verseKey: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}verse_key'],
      )!,
      pageNumber: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}page_number'],
      )!,
      juzNumber: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}juz_number'],
      )!,
      hizbNumber: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}hizb_number'],
      )!,
      textUthmani: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}text_uthmani'],
      )!,
      qpcUthmaniHafs: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}qpc_uthmani_hafs'],
      ),
    );
  }

  @override
  $VersesTable createAlias(String alias) {
    return $VersesTable(attachedDatabase, alias);
  }
}

class Verse extends DataClass implements Insertable<Verse> {
  final int id;
  final int chapterId;
  final int verseNumber;
  final String verseKey;
  final int pageNumber;
  final int juzNumber;
  final int hizbNumber;
  final String textUthmani;
  final String? qpcUthmaniHafs;
  const Verse({
    required this.id,
    required this.chapterId,
    required this.verseNumber,
    required this.verseKey,
    required this.pageNumber,
    required this.juzNumber,
    required this.hizbNumber,
    required this.textUthmani,
    this.qpcUthmaniHafs,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['chapter_id'] = Variable<int>(chapterId);
    map['verse_number'] = Variable<int>(verseNumber);
    map['verse_key'] = Variable<String>(verseKey);
    map['page_number'] = Variable<int>(pageNumber);
    map['juz_number'] = Variable<int>(juzNumber);
    map['hizb_number'] = Variable<int>(hizbNumber);
    map['text_uthmani'] = Variable<String>(textUthmani);
    if (!nullToAbsent || qpcUthmaniHafs != null) {
      map['qpc_uthmani_hafs'] = Variable<String>(qpcUthmaniHafs);
    }
    return map;
  }

  VersesCompanion toCompanion(bool nullToAbsent) {
    return VersesCompanion(
      id: Value(id),
      chapterId: Value(chapterId),
      verseNumber: Value(verseNumber),
      verseKey: Value(verseKey),
      pageNumber: Value(pageNumber),
      juzNumber: Value(juzNumber),
      hizbNumber: Value(hizbNumber),
      textUthmani: Value(textUthmani),
      qpcUthmaniHafs: qpcUthmaniHafs == null && nullToAbsent
          ? const Value.absent()
          : Value(qpcUthmaniHafs),
    );
  }

  factory Verse.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return Verse(
      id: serializer.fromJson<int>(json['id']),
      chapterId: serializer.fromJson<int>(json['chapterId']),
      verseNumber: serializer.fromJson<int>(json['verseNumber']),
      verseKey: serializer.fromJson<String>(json['verseKey']),
      pageNumber: serializer.fromJson<int>(json['pageNumber']),
      juzNumber: serializer.fromJson<int>(json['juzNumber']),
      hizbNumber: serializer.fromJson<int>(json['hizbNumber']),
      textUthmani: serializer.fromJson<String>(json['textUthmani']),
      qpcUthmaniHafs: serializer.fromJson<String?>(json['qpcUthmaniHafs']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'chapterId': serializer.toJson<int>(chapterId),
      'verseNumber': serializer.toJson<int>(verseNumber),
      'verseKey': serializer.toJson<String>(verseKey),
      'pageNumber': serializer.toJson<int>(pageNumber),
      'juzNumber': serializer.toJson<int>(juzNumber),
      'hizbNumber': serializer.toJson<int>(hizbNumber),
      'textUthmani': serializer.toJson<String>(textUthmani),
      'qpcUthmaniHafs': serializer.toJson<String?>(qpcUthmaniHafs),
    };
  }

  Verse copyWith({
    int? id,
    int? chapterId,
    int? verseNumber,
    String? verseKey,
    int? pageNumber,
    int? juzNumber,
    int? hizbNumber,
    String? textUthmani,
    Value<String?> qpcUthmaniHafs = const Value.absent(),
  }) => Verse(
    id: id ?? this.id,
    chapterId: chapterId ?? this.chapterId,
    verseNumber: verseNumber ?? this.verseNumber,
    verseKey: verseKey ?? this.verseKey,
    pageNumber: pageNumber ?? this.pageNumber,
    juzNumber: juzNumber ?? this.juzNumber,
    hizbNumber: hizbNumber ?? this.hizbNumber,
    textUthmani: textUthmani ?? this.textUthmani,
    qpcUthmaniHafs: qpcUthmaniHafs.present
        ? qpcUthmaniHafs.value
        : this.qpcUthmaniHafs,
  );
  Verse copyWithCompanion(VersesCompanion data) {
    return Verse(
      id: data.id.present ? data.id.value : this.id,
      chapterId: data.chapterId.present ? data.chapterId.value : this.chapterId,
      verseNumber: data.verseNumber.present
          ? data.verseNumber.value
          : this.verseNumber,
      verseKey: data.verseKey.present ? data.verseKey.value : this.verseKey,
      pageNumber: data.pageNumber.present
          ? data.pageNumber.value
          : this.pageNumber,
      juzNumber: data.juzNumber.present ? data.juzNumber.value : this.juzNumber,
      hizbNumber: data.hizbNumber.present
          ? data.hizbNumber.value
          : this.hizbNumber,
      textUthmani: data.textUthmani.present
          ? data.textUthmani.value
          : this.textUthmani,
      qpcUthmaniHafs: data.qpcUthmaniHafs.present
          ? data.qpcUthmaniHafs.value
          : this.qpcUthmaniHafs,
    );
  }

  @override
  String toString() {
    return (StringBuffer('Verse(')
          ..write('id: $id, ')
          ..write('chapterId: $chapterId, ')
          ..write('verseNumber: $verseNumber, ')
          ..write('verseKey: $verseKey, ')
          ..write('pageNumber: $pageNumber, ')
          ..write('juzNumber: $juzNumber, ')
          ..write('hizbNumber: $hizbNumber, ')
          ..write('textUthmani: $textUthmani, ')
          ..write('qpcUthmaniHafs: $qpcUthmaniHafs')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
    id,
    chapterId,
    verseNumber,
    verseKey,
    pageNumber,
    juzNumber,
    hizbNumber,
    textUthmani,
    qpcUthmaniHafs,
  );
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is Verse &&
          other.id == this.id &&
          other.chapterId == this.chapterId &&
          other.verseNumber == this.verseNumber &&
          other.verseKey == this.verseKey &&
          other.pageNumber == this.pageNumber &&
          other.juzNumber == this.juzNumber &&
          other.hizbNumber == this.hizbNumber &&
          other.textUthmani == this.textUthmani &&
          other.qpcUthmaniHafs == this.qpcUthmaniHafs);
}

class VersesCompanion extends UpdateCompanion<Verse> {
  final Value<int> id;
  final Value<int> chapterId;
  final Value<int> verseNumber;
  final Value<String> verseKey;
  final Value<int> pageNumber;
  final Value<int> juzNumber;
  final Value<int> hizbNumber;
  final Value<String> textUthmani;
  final Value<String?> qpcUthmaniHafs;
  const VersesCompanion({
    this.id = const Value.absent(),
    this.chapterId = const Value.absent(),
    this.verseNumber = const Value.absent(),
    this.verseKey = const Value.absent(),
    this.pageNumber = const Value.absent(),
    this.juzNumber = const Value.absent(),
    this.hizbNumber = const Value.absent(),
    this.textUthmani = const Value.absent(),
    this.qpcUthmaniHafs = const Value.absent(),
  });
  VersesCompanion.insert({
    this.id = const Value.absent(),
    required int chapterId,
    required int verseNumber,
    required String verseKey,
    required int pageNumber,
    required int juzNumber,
    required int hizbNumber,
    required String textUthmani,
    this.qpcUthmaniHafs = const Value.absent(),
  }) : chapterId = Value(chapterId),
       verseNumber = Value(verseNumber),
       verseKey = Value(verseKey),
       pageNumber = Value(pageNumber),
       juzNumber = Value(juzNumber),
       hizbNumber = Value(hizbNumber),
       textUthmani = Value(textUthmani);
  static Insertable<Verse> custom({
    Expression<int>? id,
    Expression<int>? chapterId,
    Expression<int>? verseNumber,
    Expression<String>? verseKey,
    Expression<int>? pageNumber,
    Expression<int>? juzNumber,
    Expression<int>? hizbNumber,
    Expression<String>? textUthmani,
    Expression<String>? qpcUthmaniHafs,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (chapterId != null) 'chapter_id': chapterId,
      if (verseNumber != null) 'verse_number': verseNumber,
      if (verseKey != null) 'verse_key': verseKey,
      if (pageNumber != null) 'page_number': pageNumber,
      if (juzNumber != null) 'juz_number': juzNumber,
      if (hizbNumber != null) 'hizb_number': hizbNumber,
      if (textUthmani != null) 'text_uthmani': textUthmani,
      if (qpcUthmaniHafs != null) 'qpc_uthmani_hafs': qpcUthmaniHafs,
    });
  }

  VersesCompanion copyWith({
    Value<int>? id,
    Value<int>? chapterId,
    Value<int>? verseNumber,
    Value<String>? verseKey,
    Value<int>? pageNumber,
    Value<int>? juzNumber,
    Value<int>? hizbNumber,
    Value<String>? textUthmani,
    Value<String?>? qpcUthmaniHafs,
  }) {
    return VersesCompanion(
      id: id ?? this.id,
      chapterId: chapterId ?? this.chapterId,
      verseNumber: verseNumber ?? this.verseNumber,
      verseKey: verseKey ?? this.verseKey,
      pageNumber: pageNumber ?? this.pageNumber,
      juzNumber: juzNumber ?? this.juzNumber,
      hizbNumber: hizbNumber ?? this.hizbNumber,
      textUthmani: textUthmani ?? this.textUthmani,
      qpcUthmaniHafs: qpcUthmaniHafs ?? this.qpcUthmaniHafs,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (chapterId.present) {
      map['chapter_id'] = Variable<int>(chapterId.value);
    }
    if (verseNumber.present) {
      map['verse_number'] = Variable<int>(verseNumber.value);
    }
    if (verseKey.present) {
      map['verse_key'] = Variable<String>(verseKey.value);
    }
    if (pageNumber.present) {
      map['page_number'] = Variable<int>(pageNumber.value);
    }
    if (juzNumber.present) {
      map['juz_number'] = Variable<int>(juzNumber.value);
    }
    if (hizbNumber.present) {
      map['hizb_number'] = Variable<int>(hizbNumber.value);
    }
    if (textUthmani.present) {
      map['text_uthmani'] = Variable<String>(textUthmani.value);
    }
    if (qpcUthmaniHafs.present) {
      map['qpc_uthmani_hafs'] = Variable<String>(qpcUthmaniHafs.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('VersesCompanion(')
          ..write('id: $id, ')
          ..write('chapterId: $chapterId, ')
          ..write('verseNumber: $verseNumber, ')
          ..write('verseKey: $verseKey, ')
          ..write('pageNumber: $pageNumber, ')
          ..write('juzNumber: $juzNumber, ')
          ..write('hizbNumber: $hizbNumber, ')
          ..write('textUthmani: $textUthmani, ')
          ..write('qpcUthmaniHafs: $qpcUthmaniHafs')
          ..write(')'))
        .toString();
  }
}

class $WordsTable extends Words with TableInfo<$WordsTable, Word> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $WordsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _verseIdMeta = const VerificationMeta(
    'verseId',
  );
  @override
  late final GeneratedColumn<int> verseId = GeneratedColumn<int>(
    'verse_id',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'REFERENCES verses (id)',
    ),
  );
  static const VerificationMeta _positionMeta = const VerificationMeta(
    'position',
  );
  @override
  late final GeneratedColumn<int> position = GeneratedColumn<int>(
    'position',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _audioUrlMeta = const VerificationMeta(
    'audioUrl',
  );
  @override
  late final GeneratedColumn<String> audioUrl = GeneratedColumn<String>(
    'audio_url',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _charTypeNameMeta = const VerificationMeta(
    'charTypeName',
  );
  @override
  late final GeneratedColumn<String> charTypeName = GeneratedColumn<String>(
    'char_type_name',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _textUthmaniMeta = const VerificationMeta(
    'textUthmani',
  );
  @override
  late final GeneratedColumn<String> textUthmani = GeneratedColumn<String>(
    'text_uthmani',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _qpcUthmaniHafsMeta = const VerificationMeta(
    'qpcUthmaniHafs',
  );
  @override
  late final GeneratedColumn<String> qpcUthmaniHafs = GeneratedColumn<String>(
    'qpc_uthmani_hafs',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _textUthmaniTajweedMeta =
      const VerificationMeta('textUthmaniTajweed');
  @override
  late final GeneratedColumn<String> textUthmaniTajweed =
      GeneratedColumn<String>(
        'text_uthmani_tajweed',
        aliasedName,
        true,
        type: DriftSqlType.string,
        requiredDuringInsert: false,
      );
  static const VerificationMeta _translationMeta = const VerificationMeta(
    'translation',
  );
  @override
  late final GeneratedColumn<String> translation = GeneratedColumn<String>(
    'translation',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _transliterationMeta = const VerificationMeta(
    'transliteration',
  );
  @override
  late final GeneratedColumn<String> transliteration = GeneratedColumn<String>(
    'transliteration',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    verseId,
    position,
    audioUrl,
    charTypeName,
    textUthmani,
    qpcUthmaniHafs,
    textUthmaniTajweed,
    translation,
    transliteration,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'words';
  @override
  VerificationContext validateIntegrity(
    Insertable<Word> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('verse_id')) {
      context.handle(
        _verseIdMeta,
        verseId.isAcceptableOrUnknown(data['verse_id']!, _verseIdMeta),
      );
    } else if (isInserting) {
      context.missing(_verseIdMeta);
    }
    if (data.containsKey('position')) {
      context.handle(
        _positionMeta,
        position.isAcceptableOrUnknown(data['position']!, _positionMeta),
      );
    } else if (isInserting) {
      context.missing(_positionMeta);
    }
    if (data.containsKey('audio_url')) {
      context.handle(
        _audioUrlMeta,
        audioUrl.isAcceptableOrUnknown(data['audio_url']!, _audioUrlMeta),
      );
    }
    if (data.containsKey('char_type_name')) {
      context.handle(
        _charTypeNameMeta,
        charTypeName.isAcceptableOrUnknown(
          data['char_type_name']!,
          _charTypeNameMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_charTypeNameMeta);
    }
    if (data.containsKey('text_uthmani')) {
      context.handle(
        _textUthmaniMeta,
        textUthmani.isAcceptableOrUnknown(
          data['text_uthmani']!,
          _textUthmaniMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_textUthmaniMeta);
    }
    if (data.containsKey('qpc_uthmani_hafs')) {
      context.handle(
        _qpcUthmaniHafsMeta,
        qpcUthmaniHafs.isAcceptableOrUnknown(
          data['qpc_uthmani_hafs']!,
          _qpcUthmaniHafsMeta,
        ),
      );
    }
    if (data.containsKey('text_uthmani_tajweed')) {
      context.handle(
        _textUthmaniTajweedMeta,
        textUthmaniTajweed.isAcceptableOrUnknown(
          data['text_uthmani_tajweed']!,
          _textUthmaniTajweedMeta,
        ),
      );
    }
    if (data.containsKey('translation')) {
      context.handle(
        _translationMeta,
        translation.isAcceptableOrUnknown(
          data['translation']!,
          _translationMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_translationMeta);
    }
    if (data.containsKey('transliteration')) {
      context.handle(
        _transliterationMeta,
        transliteration.isAcceptableOrUnknown(
          data['transliteration']!,
          _transliterationMeta,
        ),
      );
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  Word map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return Word(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}id'],
      )!,
      verseId: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}verse_id'],
      )!,
      position: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}position'],
      )!,
      audioUrl: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}audio_url'],
      ),
      charTypeName: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}char_type_name'],
      )!,
      textUthmani: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}text_uthmani'],
      )!,
      qpcUthmaniHafs: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}qpc_uthmani_hafs'],
      ),
      textUthmaniTajweed: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}text_uthmani_tajweed'],
      ),
      translation: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}translation'],
      )!,
      transliteration: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}transliteration'],
      ),
    );
  }

  @override
  $WordsTable createAlias(String alias) {
    return $WordsTable(attachedDatabase, alias);
  }
}

class Word extends DataClass implements Insertable<Word> {
  final int id;
  final int verseId;
  final int position;
  final String? audioUrl;
  final String charTypeName;
  final String textUthmani;
  final String? qpcUthmaniHafs;
  final String? textUthmaniTajweed;
  final String translation;
  final String? transliteration;
  const Word({
    required this.id,
    required this.verseId,
    required this.position,
    this.audioUrl,
    required this.charTypeName,
    required this.textUthmani,
    this.qpcUthmaniHafs,
    this.textUthmaniTajweed,
    required this.translation,
    this.transliteration,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['verse_id'] = Variable<int>(verseId);
    map['position'] = Variable<int>(position);
    if (!nullToAbsent || audioUrl != null) {
      map['audio_url'] = Variable<String>(audioUrl);
    }
    map['char_type_name'] = Variable<String>(charTypeName);
    map['text_uthmani'] = Variable<String>(textUthmani);
    if (!nullToAbsent || qpcUthmaniHafs != null) {
      map['qpc_uthmani_hafs'] = Variable<String>(qpcUthmaniHafs);
    }
    if (!nullToAbsent || textUthmaniTajweed != null) {
      map['text_uthmani_tajweed'] = Variable<String>(textUthmaniTajweed);
    }
    map['translation'] = Variable<String>(translation);
    if (!nullToAbsent || transliteration != null) {
      map['transliteration'] = Variable<String>(transliteration);
    }
    return map;
  }

  WordsCompanion toCompanion(bool nullToAbsent) {
    return WordsCompanion(
      id: Value(id),
      verseId: Value(verseId),
      position: Value(position),
      audioUrl: audioUrl == null && nullToAbsent
          ? const Value.absent()
          : Value(audioUrl),
      charTypeName: Value(charTypeName),
      textUthmani: Value(textUthmani),
      qpcUthmaniHafs: qpcUthmaniHafs == null && nullToAbsent
          ? const Value.absent()
          : Value(qpcUthmaniHafs),
      textUthmaniTajweed: textUthmaniTajweed == null && nullToAbsent
          ? const Value.absent()
          : Value(textUthmaniTajweed),
      translation: Value(translation),
      transliteration: transliteration == null && nullToAbsent
          ? const Value.absent()
          : Value(transliteration),
    );
  }

  factory Word.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return Word(
      id: serializer.fromJson<int>(json['id']),
      verseId: serializer.fromJson<int>(json['verseId']),
      position: serializer.fromJson<int>(json['position']),
      audioUrl: serializer.fromJson<String?>(json['audioUrl']),
      charTypeName: serializer.fromJson<String>(json['charTypeName']),
      textUthmani: serializer.fromJson<String>(json['textUthmani']),
      qpcUthmaniHafs: serializer.fromJson<String?>(json['qpcUthmaniHafs']),
      textUthmaniTajweed: serializer.fromJson<String?>(
        json['textUthmaniTajweed'],
      ),
      translation: serializer.fromJson<String>(json['translation']),
      transliteration: serializer.fromJson<String?>(json['transliteration']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'verseId': serializer.toJson<int>(verseId),
      'position': serializer.toJson<int>(position),
      'audioUrl': serializer.toJson<String?>(audioUrl),
      'charTypeName': serializer.toJson<String>(charTypeName),
      'textUthmani': serializer.toJson<String>(textUthmani),
      'qpcUthmaniHafs': serializer.toJson<String?>(qpcUthmaniHafs),
      'textUthmaniTajweed': serializer.toJson<String?>(textUthmaniTajweed),
      'translation': serializer.toJson<String>(translation),
      'transliteration': serializer.toJson<String?>(transliteration),
    };
  }

  Word copyWith({
    int? id,
    int? verseId,
    int? position,
    Value<String?> audioUrl = const Value.absent(),
    String? charTypeName,
    String? textUthmani,
    Value<String?> qpcUthmaniHafs = const Value.absent(),
    Value<String?> textUthmaniTajweed = const Value.absent(),
    String? translation,
    Value<String?> transliteration = const Value.absent(),
  }) => Word(
    id: id ?? this.id,
    verseId: verseId ?? this.verseId,
    position: position ?? this.position,
    audioUrl: audioUrl.present ? audioUrl.value : this.audioUrl,
    charTypeName: charTypeName ?? this.charTypeName,
    textUthmani: textUthmani ?? this.textUthmani,
    qpcUthmaniHafs: qpcUthmaniHafs.present
        ? qpcUthmaniHafs.value
        : this.qpcUthmaniHafs,
    textUthmaniTajweed: textUthmaniTajweed.present
        ? textUthmaniTajweed.value
        : this.textUthmaniTajweed,
    translation: translation ?? this.translation,
    transliteration: transliteration.present
        ? transliteration.value
        : this.transliteration,
  );
  Word copyWithCompanion(WordsCompanion data) {
    return Word(
      id: data.id.present ? data.id.value : this.id,
      verseId: data.verseId.present ? data.verseId.value : this.verseId,
      position: data.position.present ? data.position.value : this.position,
      audioUrl: data.audioUrl.present ? data.audioUrl.value : this.audioUrl,
      charTypeName: data.charTypeName.present
          ? data.charTypeName.value
          : this.charTypeName,
      textUthmani: data.textUthmani.present
          ? data.textUthmani.value
          : this.textUthmani,
      qpcUthmaniHafs: data.qpcUthmaniHafs.present
          ? data.qpcUthmaniHafs.value
          : this.qpcUthmaniHafs,
      textUthmaniTajweed: data.textUthmaniTajweed.present
          ? data.textUthmaniTajweed.value
          : this.textUthmaniTajweed,
      translation: data.translation.present
          ? data.translation.value
          : this.translation,
      transliteration: data.transliteration.present
          ? data.transliteration.value
          : this.transliteration,
    );
  }

  @override
  String toString() {
    return (StringBuffer('Word(')
          ..write('id: $id, ')
          ..write('verseId: $verseId, ')
          ..write('position: $position, ')
          ..write('audioUrl: $audioUrl, ')
          ..write('charTypeName: $charTypeName, ')
          ..write('textUthmani: $textUthmani, ')
          ..write('qpcUthmaniHafs: $qpcUthmaniHafs, ')
          ..write('textUthmaniTajweed: $textUthmaniTajweed, ')
          ..write('translation: $translation, ')
          ..write('transliteration: $transliteration')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
    id,
    verseId,
    position,
    audioUrl,
    charTypeName,
    textUthmani,
    qpcUthmaniHafs,
    textUthmaniTajweed,
    translation,
    transliteration,
  );
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is Word &&
          other.id == this.id &&
          other.verseId == this.verseId &&
          other.position == this.position &&
          other.audioUrl == this.audioUrl &&
          other.charTypeName == this.charTypeName &&
          other.textUthmani == this.textUthmani &&
          other.qpcUthmaniHafs == this.qpcUthmaniHafs &&
          other.textUthmaniTajweed == this.textUthmaniTajweed &&
          other.translation == this.translation &&
          other.transliteration == this.transliteration);
}

class WordsCompanion extends UpdateCompanion<Word> {
  final Value<int> id;
  final Value<int> verseId;
  final Value<int> position;
  final Value<String?> audioUrl;
  final Value<String> charTypeName;
  final Value<String> textUthmani;
  final Value<String?> qpcUthmaniHafs;
  final Value<String?> textUthmaniTajweed;
  final Value<String> translation;
  final Value<String?> transliteration;
  const WordsCompanion({
    this.id = const Value.absent(),
    this.verseId = const Value.absent(),
    this.position = const Value.absent(),
    this.audioUrl = const Value.absent(),
    this.charTypeName = const Value.absent(),
    this.textUthmani = const Value.absent(),
    this.qpcUthmaniHafs = const Value.absent(),
    this.textUthmaniTajweed = const Value.absent(),
    this.translation = const Value.absent(),
    this.transliteration = const Value.absent(),
  });
  WordsCompanion.insert({
    this.id = const Value.absent(),
    required int verseId,
    required int position,
    this.audioUrl = const Value.absent(),
    required String charTypeName,
    required String textUthmani,
    this.qpcUthmaniHafs = const Value.absent(),
    this.textUthmaniTajweed = const Value.absent(),
    required String translation,
    this.transliteration = const Value.absent(),
  }) : verseId = Value(verseId),
       position = Value(position),
       charTypeName = Value(charTypeName),
       textUthmani = Value(textUthmani),
       translation = Value(translation);
  static Insertable<Word> custom({
    Expression<int>? id,
    Expression<int>? verseId,
    Expression<int>? position,
    Expression<String>? audioUrl,
    Expression<String>? charTypeName,
    Expression<String>? textUthmani,
    Expression<String>? qpcUthmaniHafs,
    Expression<String>? textUthmaniTajweed,
    Expression<String>? translation,
    Expression<String>? transliteration,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (verseId != null) 'verse_id': verseId,
      if (position != null) 'position': position,
      if (audioUrl != null) 'audio_url': audioUrl,
      if (charTypeName != null) 'char_type_name': charTypeName,
      if (textUthmani != null) 'text_uthmani': textUthmani,
      if (qpcUthmaniHafs != null) 'qpc_uthmani_hafs': qpcUthmaniHafs,
      if (textUthmaniTajweed != null)
        'text_uthmani_tajweed': textUthmaniTajweed,
      if (translation != null) 'translation': translation,
      if (transliteration != null) 'transliteration': transliteration,
    });
  }

  WordsCompanion copyWith({
    Value<int>? id,
    Value<int>? verseId,
    Value<int>? position,
    Value<String?>? audioUrl,
    Value<String>? charTypeName,
    Value<String>? textUthmani,
    Value<String?>? qpcUthmaniHafs,
    Value<String?>? textUthmaniTajweed,
    Value<String>? translation,
    Value<String?>? transliteration,
  }) {
    return WordsCompanion(
      id: id ?? this.id,
      verseId: verseId ?? this.verseId,
      position: position ?? this.position,
      audioUrl: audioUrl ?? this.audioUrl,
      charTypeName: charTypeName ?? this.charTypeName,
      textUthmani: textUthmani ?? this.textUthmani,
      qpcUthmaniHafs: qpcUthmaniHafs ?? this.qpcUthmaniHafs,
      textUthmaniTajweed: textUthmaniTajweed ?? this.textUthmaniTajweed,
      translation: translation ?? this.translation,
      transliteration: transliteration ?? this.transliteration,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (verseId.present) {
      map['verse_id'] = Variable<int>(verseId.value);
    }
    if (position.present) {
      map['position'] = Variable<int>(position.value);
    }
    if (audioUrl.present) {
      map['audio_url'] = Variable<String>(audioUrl.value);
    }
    if (charTypeName.present) {
      map['char_type_name'] = Variable<String>(charTypeName.value);
    }
    if (textUthmani.present) {
      map['text_uthmani'] = Variable<String>(textUthmani.value);
    }
    if (qpcUthmaniHafs.present) {
      map['qpc_uthmani_hafs'] = Variable<String>(qpcUthmaniHafs.value);
    }
    if (textUthmaniTajweed.present) {
      map['text_uthmani_tajweed'] = Variable<String>(textUthmaniTajweed.value);
    }
    if (translation.present) {
      map['translation'] = Variable<String>(translation.value);
    }
    if (transliteration.present) {
      map['transliteration'] = Variable<String>(transliteration.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('WordsCompanion(')
          ..write('id: $id, ')
          ..write('verseId: $verseId, ')
          ..write('position: $position, ')
          ..write('audioUrl: $audioUrl, ')
          ..write('charTypeName: $charTypeName, ')
          ..write('textUthmani: $textUthmani, ')
          ..write('qpcUthmaniHafs: $qpcUthmaniHafs, ')
          ..write('textUthmaniTajweed: $textUthmaniTajweed, ')
          ..write('translation: $translation, ')
          ..write('transliteration: $transliteration')
          ..write(')'))
        .toString();
  }
}

class $VerseTranslationsTable extends VerseTranslations
    with TableInfo<$VerseTranslationsTable, VerseTranslation> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $VerseTranslationsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
    'id',
    aliasedName,
    false,
    hasAutoIncrement: true,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'PRIMARY KEY AUTOINCREMENT',
    ),
  );
  static const VerificationMeta _verseIdMeta = const VerificationMeta(
    'verseId',
  );
  @override
  late final GeneratedColumn<int> verseId = GeneratedColumn<int>(
    'verse_id',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'REFERENCES verses (id)',
    ),
  );
  static const VerificationMeta _resourceIdMeta = const VerificationMeta(
    'resourceId',
  );
  @override
  late final GeneratedColumn<int> resourceId = GeneratedColumn<int>(
    'resource_id',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _translationTextMeta = const VerificationMeta(
    'translationText',
  );
  @override
  late final GeneratedColumn<String> translationText = GeneratedColumn<String>(
    'text',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    verseId,
    resourceId,
    translationText,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'verse_translations';
  @override
  VerificationContext validateIntegrity(
    Insertable<VerseTranslation> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('verse_id')) {
      context.handle(
        _verseIdMeta,
        verseId.isAcceptableOrUnknown(data['verse_id']!, _verseIdMeta),
      );
    } else if (isInserting) {
      context.missing(_verseIdMeta);
    }
    if (data.containsKey('resource_id')) {
      context.handle(
        _resourceIdMeta,
        resourceId.isAcceptableOrUnknown(data['resource_id']!, _resourceIdMeta),
      );
    } else if (isInserting) {
      context.missing(_resourceIdMeta);
    }
    if (data.containsKey('text')) {
      context.handle(
        _translationTextMeta,
        translationText.isAcceptableOrUnknown(
          data['text']!,
          _translationTextMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_translationTextMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  VerseTranslation map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return VerseTranslation(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}id'],
      )!,
      verseId: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}verse_id'],
      )!,
      resourceId: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}resource_id'],
      )!,
      translationText: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}text'],
      )!,
    );
  }

  @override
  $VerseTranslationsTable createAlias(String alias) {
    return $VerseTranslationsTable(attachedDatabase, alias);
  }
}

class VerseTranslation extends DataClass
    implements Insertable<VerseTranslation> {
  final int id;
  final int verseId;
  final int resourceId;
  final String translationText;
  const VerseTranslation({
    required this.id,
    required this.verseId,
    required this.resourceId,
    required this.translationText,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['verse_id'] = Variable<int>(verseId);
    map['resource_id'] = Variable<int>(resourceId);
    map['text'] = Variable<String>(translationText);
    return map;
  }

  VerseTranslationsCompanion toCompanion(bool nullToAbsent) {
    return VerseTranslationsCompanion(
      id: Value(id),
      verseId: Value(verseId),
      resourceId: Value(resourceId),
      translationText: Value(translationText),
    );
  }

  factory VerseTranslation.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return VerseTranslation(
      id: serializer.fromJson<int>(json['id']),
      verseId: serializer.fromJson<int>(json['verseId']),
      resourceId: serializer.fromJson<int>(json['resourceId']),
      translationText: serializer.fromJson<String>(json['translationText']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'verseId': serializer.toJson<int>(verseId),
      'resourceId': serializer.toJson<int>(resourceId),
      'translationText': serializer.toJson<String>(translationText),
    };
  }

  VerseTranslation copyWith({
    int? id,
    int? verseId,
    int? resourceId,
    String? translationText,
  }) => VerseTranslation(
    id: id ?? this.id,
    verseId: verseId ?? this.verseId,
    resourceId: resourceId ?? this.resourceId,
    translationText: translationText ?? this.translationText,
  );
  VerseTranslation copyWithCompanion(VerseTranslationsCompanion data) {
    return VerseTranslation(
      id: data.id.present ? data.id.value : this.id,
      verseId: data.verseId.present ? data.verseId.value : this.verseId,
      resourceId: data.resourceId.present
          ? data.resourceId.value
          : this.resourceId,
      translationText: data.translationText.present
          ? data.translationText.value
          : this.translationText,
    );
  }

  @override
  String toString() {
    return (StringBuffer('VerseTranslation(')
          ..write('id: $id, ')
          ..write('verseId: $verseId, ')
          ..write('resourceId: $resourceId, ')
          ..write('translationText: $translationText')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, verseId, resourceId, translationText);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is VerseTranslation &&
          other.id == this.id &&
          other.verseId == this.verseId &&
          other.resourceId == this.resourceId &&
          other.translationText == this.translationText);
}

class VerseTranslationsCompanion extends UpdateCompanion<VerseTranslation> {
  final Value<int> id;
  final Value<int> verseId;
  final Value<int> resourceId;
  final Value<String> translationText;
  const VerseTranslationsCompanion({
    this.id = const Value.absent(),
    this.verseId = const Value.absent(),
    this.resourceId = const Value.absent(),
    this.translationText = const Value.absent(),
  });
  VerseTranslationsCompanion.insert({
    this.id = const Value.absent(),
    required int verseId,
    required int resourceId,
    required String translationText,
  }) : verseId = Value(verseId),
       resourceId = Value(resourceId),
       translationText = Value(translationText);
  static Insertable<VerseTranslation> custom({
    Expression<int>? id,
    Expression<int>? verseId,
    Expression<int>? resourceId,
    Expression<String>? translationText,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (verseId != null) 'verse_id': verseId,
      if (resourceId != null) 'resource_id': resourceId,
      if (translationText != null) 'text': translationText,
    });
  }

  VerseTranslationsCompanion copyWith({
    Value<int>? id,
    Value<int>? verseId,
    Value<int>? resourceId,
    Value<String>? translationText,
  }) {
    return VerseTranslationsCompanion(
      id: id ?? this.id,
      verseId: verseId ?? this.verseId,
      resourceId: resourceId ?? this.resourceId,
      translationText: translationText ?? this.translationText,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (verseId.present) {
      map['verse_id'] = Variable<int>(verseId.value);
    }
    if (resourceId.present) {
      map['resource_id'] = Variable<int>(resourceId.value);
    }
    if (translationText.present) {
      map['text'] = Variable<String>(translationText.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('VerseTranslationsCompanion(')
          ..write('id: $id, ')
          ..write('verseId: $verseId, ')
          ..write('resourceId: $resourceId, ')
          ..write('translationText: $translationText')
          ..write(')'))
        .toString();
  }
}

class $DownloadedAudioTable extends DownloadedAudio
    with TableInfo<$DownloadedAudioTable, DownloadedAudioData> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $DownloadedAudioTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _reciterIdMeta = const VerificationMeta(
    'reciterId',
  );
  @override
  late final GeneratedColumn<int> reciterId = GeneratedColumn<int>(
    'reciter_id',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _chapterIdMeta = const VerificationMeta(
    'chapterId',
  );
  @override
  late final GeneratedColumn<int> chapterId = GeneratedColumn<int>(
    'chapter_id',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _localPathMeta = const VerificationMeta(
    'localPath',
  );
  @override
  late final GeneratedColumn<String> localPath = GeneratedColumn<String>(
    'local_path',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _downloadedAtMeta = const VerificationMeta(
    'downloadedAt',
  );
  @override
  late final GeneratedColumn<DateTime> downloadedAt = GeneratedColumn<DateTime>(
    'downloaded_at',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: true,
  );
  @override
  List<GeneratedColumn> get $columns => [
    reciterId,
    chapterId,
    localPath,
    downloadedAt,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'downloaded_audio';
  @override
  VerificationContext validateIntegrity(
    Insertable<DownloadedAudioData> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('reciter_id')) {
      context.handle(
        _reciterIdMeta,
        reciterId.isAcceptableOrUnknown(data['reciter_id']!, _reciterIdMeta),
      );
    } else if (isInserting) {
      context.missing(_reciterIdMeta);
    }
    if (data.containsKey('chapter_id')) {
      context.handle(
        _chapterIdMeta,
        chapterId.isAcceptableOrUnknown(data['chapter_id']!, _chapterIdMeta),
      );
    } else if (isInserting) {
      context.missing(_chapterIdMeta);
    }
    if (data.containsKey('local_path')) {
      context.handle(
        _localPathMeta,
        localPath.isAcceptableOrUnknown(data['local_path']!, _localPathMeta),
      );
    } else if (isInserting) {
      context.missing(_localPathMeta);
    }
    if (data.containsKey('downloaded_at')) {
      context.handle(
        _downloadedAtMeta,
        downloadedAt.isAcceptableOrUnknown(
          data['downloaded_at']!,
          _downloadedAtMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_downloadedAtMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {reciterId, chapterId};
  @override
  DownloadedAudioData map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return DownloadedAudioData(
      reciterId: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}reciter_id'],
      )!,
      chapterId: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}chapter_id'],
      )!,
      localPath: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}local_path'],
      )!,
      downloadedAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}downloaded_at'],
      )!,
    );
  }

  @override
  $DownloadedAudioTable createAlias(String alias) {
    return $DownloadedAudioTable(attachedDatabase, alias);
  }
}

class DownloadedAudioData extends DataClass
    implements Insertable<DownloadedAudioData> {
  final int reciterId;
  final int chapterId;
  final String localPath;
  final DateTime downloadedAt;
  const DownloadedAudioData({
    required this.reciterId,
    required this.chapterId,
    required this.localPath,
    required this.downloadedAt,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['reciter_id'] = Variable<int>(reciterId);
    map['chapter_id'] = Variable<int>(chapterId);
    map['local_path'] = Variable<String>(localPath);
    map['downloaded_at'] = Variable<DateTime>(downloadedAt);
    return map;
  }

  DownloadedAudioCompanion toCompanion(bool nullToAbsent) {
    return DownloadedAudioCompanion(
      reciterId: Value(reciterId),
      chapterId: Value(chapterId),
      localPath: Value(localPath),
      downloadedAt: Value(downloadedAt),
    );
  }

  factory DownloadedAudioData.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return DownloadedAudioData(
      reciterId: serializer.fromJson<int>(json['reciterId']),
      chapterId: serializer.fromJson<int>(json['chapterId']),
      localPath: serializer.fromJson<String>(json['localPath']),
      downloadedAt: serializer.fromJson<DateTime>(json['downloadedAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'reciterId': serializer.toJson<int>(reciterId),
      'chapterId': serializer.toJson<int>(chapterId),
      'localPath': serializer.toJson<String>(localPath),
      'downloadedAt': serializer.toJson<DateTime>(downloadedAt),
    };
  }

  DownloadedAudioData copyWith({
    int? reciterId,
    int? chapterId,
    String? localPath,
    DateTime? downloadedAt,
  }) => DownloadedAudioData(
    reciterId: reciterId ?? this.reciterId,
    chapterId: chapterId ?? this.chapterId,
    localPath: localPath ?? this.localPath,
    downloadedAt: downloadedAt ?? this.downloadedAt,
  );
  DownloadedAudioData copyWithCompanion(DownloadedAudioCompanion data) {
    return DownloadedAudioData(
      reciterId: data.reciterId.present ? data.reciterId.value : this.reciterId,
      chapterId: data.chapterId.present ? data.chapterId.value : this.chapterId,
      localPath: data.localPath.present ? data.localPath.value : this.localPath,
      downloadedAt: data.downloadedAt.present
          ? data.downloadedAt.value
          : this.downloadedAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('DownloadedAudioData(')
          ..write('reciterId: $reciterId, ')
          ..write('chapterId: $chapterId, ')
          ..write('localPath: $localPath, ')
          ..write('downloadedAt: $downloadedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode =>
      Object.hash(reciterId, chapterId, localPath, downloadedAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is DownloadedAudioData &&
          other.reciterId == this.reciterId &&
          other.chapterId == this.chapterId &&
          other.localPath == this.localPath &&
          other.downloadedAt == this.downloadedAt);
}

class DownloadedAudioCompanion extends UpdateCompanion<DownloadedAudioData> {
  final Value<int> reciterId;
  final Value<int> chapterId;
  final Value<String> localPath;
  final Value<DateTime> downloadedAt;
  final Value<int> rowid;
  const DownloadedAudioCompanion({
    this.reciterId = const Value.absent(),
    this.chapterId = const Value.absent(),
    this.localPath = const Value.absent(),
    this.downloadedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  DownloadedAudioCompanion.insert({
    required int reciterId,
    required int chapterId,
    required String localPath,
    required DateTime downloadedAt,
    this.rowid = const Value.absent(),
  }) : reciterId = Value(reciterId),
       chapterId = Value(chapterId),
       localPath = Value(localPath),
       downloadedAt = Value(downloadedAt);
  static Insertable<DownloadedAudioData> custom({
    Expression<int>? reciterId,
    Expression<int>? chapterId,
    Expression<String>? localPath,
    Expression<DateTime>? downloadedAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (reciterId != null) 'reciter_id': reciterId,
      if (chapterId != null) 'chapter_id': chapterId,
      if (localPath != null) 'local_path': localPath,
      if (downloadedAt != null) 'downloaded_at': downloadedAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  DownloadedAudioCompanion copyWith({
    Value<int>? reciterId,
    Value<int>? chapterId,
    Value<String>? localPath,
    Value<DateTime>? downloadedAt,
    Value<int>? rowid,
  }) {
    return DownloadedAudioCompanion(
      reciterId: reciterId ?? this.reciterId,
      chapterId: chapterId ?? this.chapterId,
      localPath: localPath ?? this.localPath,
      downloadedAt: downloadedAt ?? this.downloadedAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (reciterId.present) {
      map['reciter_id'] = Variable<int>(reciterId.value);
    }
    if (chapterId.present) {
      map['chapter_id'] = Variable<int>(chapterId.value);
    }
    if (localPath.present) {
      map['local_path'] = Variable<String>(localPath.value);
    }
    if (downloadedAt.present) {
      map['downloaded_at'] = Variable<DateTime>(downloadedAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('DownloadedAudioCompanion(')
          ..write('reciterId: $reciterId, ')
          ..write('chapterId: $chapterId, ')
          ..write('localPath: $localPath, ')
          ..write('downloadedAt: $downloadedAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

abstract class _$QuranDatabase extends GeneratedDatabase {
  _$QuranDatabase(QueryExecutor e) : super(e);
  $QuranDatabaseManager get managers => $QuranDatabaseManager(this);
  late final $ChaptersTable chapters = $ChaptersTable(this);
  late final $VersesTable verses = $VersesTable(this);
  late final $WordsTable words = $WordsTable(this);
  late final $VerseTranslationsTable verseTranslations =
      $VerseTranslationsTable(this);
  late final $DownloadedAudioTable downloadedAudio = $DownloadedAudioTable(
    this,
  );
  @override
  Iterable<TableInfo<Table, Object?>> get allTables =>
      allSchemaEntities.whereType<TableInfo<Table, Object?>>();
  @override
  List<DatabaseSchemaEntity> get allSchemaEntities => [
    chapters,
    verses,
    words,
    verseTranslations,
    downloadedAudio,
  ];
}

typedef $$ChaptersTableCreateCompanionBuilder =
    ChaptersCompanion Function({
      Value<int> id,
      required String revelationPlace,
      required int revelationOrder,
      required bool bismillahPre,
      required String nameSimple,
      required String nameComplex,
      required String nameArabic,
      required int versesCount,
      required String pages,
      required String translatedName,
    });
typedef $$ChaptersTableUpdateCompanionBuilder =
    ChaptersCompanion Function({
      Value<int> id,
      Value<String> revelationPlace,
      Value<int> revelationOrder,
      Value<bool> bismillahPre,
      Value<String> nameSimple,
      Value<String> nameComplex,
      Value<String> nameArabic,
      Value<int> versesCount,
      Value<String> pages,
      Value<String> translatedName,
    });

final class $$ChaptersTableReferences
    extends BaseReferences<_$QuranDatabase, $ChaptersTable, Chapter> {
  $$ChaptersTableReferences(super.$_db, super.$_table, super.$_typedResult);

  static MultiTypedResultKey<$VersesTable, List<Verse>> _versesRefsTable(
    _$QuranDatabase db,
  ) => MultiTypedResultKey.fromTable(
    db.verses,
    aliasName: $_aliasNameGenerator(db.chapters.id, db.verses.chapterId),
  );

  $$VersesTableProcessedTableManager get versesRefs {
    final manager = $$VersesTableTableManager(
      $_db,
      $_db.verses,
    ).filter((f) => f.chapterId.id.sqlEquals($_itemColumn<int>('id')!));

    final cache = $_typedResult.readTableOrNull(_versesRefsTable($_db));
    return ProcessedTableManager(
      manager.$state.copyWith(prefetchedData: cache),
    );
  }
}

class $$ChaptersTableFilterComposer
    extends Composer<_$QuranDatabase, $ChaptersTable> {
  $$ChaptersTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get revelationPlace => $composableBuilder(
    column: $table.revelationPlace,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get revelationOrder => $composableBuilder(
    column: $table.revelationOrder,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<bool> get bismillahPre => $composableBuilder(
    column: $table.bismillahPre,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get nameSimple => $composableBuilder(
    column: $table.nameSimple,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get nameComplex => $composableBuilder(
    column: $table.nameComplex,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get nameArabic => $composableBuilder(
    column: $table.nameArabic,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get versesCount => $composableBuilder(
    column: $table.versesCount,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get pages => $composableBuilder(
    column: $table.pages,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get translatedName => $composableBuilder(
    column: $table.translatedName,
    builder: (column) => ColumnFilters(column),
  );

  Expression<bool> versesRefs(
    Expression<bool> Function($$VersesTableFilterComposer f) f,
  ) {
    final $$VersesTableFilterComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.id,
      referencedTable: $db.verses,
      getReferencedColumn: (t) => t.chapterId,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$VersesTableFilterComposer(
            $db: $db,
            $table: $db.verses,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return f(composer);
  }
}

class $$ChaptersTableOrderingComposer
    extends Composer<_$QuranDatabase, $ChaptersTable> {
  $$ChaptersTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get revelationPlace => $composableBuilder(
    column: $table.revelationPlace,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get revelationOrder => $composableBuilder(
    column: $table.revelationOrder,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<bool> get bismillahPre => $composableBuilder(
    column: $table.bismillahPre,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get nameSimple => $composableBuilder(
    column: $table.nameSimple,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get nameComplex => $composableBuilder(
    column: $table.nameComplex,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get nameArabic => $composableBuilder(
    column: $table.nameArabic,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get versesCount => $composableBuilder(
    column: $table.versesCount,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get pages => $composableBuilder(
    column: $table.pages,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get translatedName => $composableBuilder(
    column: $table.translatedName,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$ChaptersTableAnnotationComposer
    extends Composer<_$QuranDatabase, $ChaptersTable> {
  $$ChaptersTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get revelationPlace => $composableBuilder(
    column: $table.revelationPlace,
    builder: (column) => column,
  );

  GeneratedColumn<int> get revelationOrder => $composableBuilder(
    column: $table.revelationOrder,
    builder: (column) => column,
  );

  GeneratedColumn<bool> get bismillahPre => $composableBuilder(
    column: $table.bismillahPre,
    builder: (column) => column,
  );

  GeneratedColumn<String> get nameSimple => $composableBuilder(
    column: $table.nameSimple,
    builder: (column) => column,
  );

  GeneratedColumn<String> get nameComplex => $composableBuilder(
    column: $table.nameComplex,
    builder: (column) => column,
  );

  GeneratedColumn<String> get nameArabic => $composableBuilder(
    column: $table.nameArabic,
    builder: (column) => column,
  );

  GeneratedColumn<int> get versesCount => $composableBuilder(
    column: $table.versesCount,
    builder: (column) => column,
  );

  GeneratedColumn<String> get pages =>
      $composableBuilder(column: $table.pages, builder: (column) => column);

  GeneratedColumn<String> get translatedName => $composableBuilder(
    column: $table.translatedName,
    builder: (column) => column,
  );

  Expression<T> versesRefs<T extends Object>(
    Expression<T> Function($$VersesTableAnnotationComposer a) f,
  ) {
    final $$VersesTableAnnotationComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.id,
      referencedTable: $db.verses,
      getReferencedColumn: (t) => t.chapterId,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$VersesTableAnnotationComposer(
            $db: $db,
            $table: $db.verses,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return f(composer);
  }
}

class $$ChaptersTableTableManager
    extends
        RootTableManager<
          _$QuranDatabase,
          $ChaptersTable,
          Chapter,
          $$ChaptersTableFilterComposer,
          $$ChaptersTableOrderingComposer,
          $$ChaptersTableAnnotationComposer,
          $$ChaptersTableCreateCompanionBuilder,
          $$ChaptersTableUpdateCompanionBuilder,
          (Chapter, $$ChaptersTableReferences),
          Chapter,
          PrefetchHooks Function({bool versesRefs})
        > {
  $$ChaptersTableTableManager(_$QuranDatabase db, $ChaptersTable table)
    : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$ChaptersTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$ChaptersTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$ChaptersTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                Value<String> revelationPlace = const Value.absent(),
                Value<int> revelationOrder = const Value.absent(),
                Value<bool> bismillahPre = const Value.absent(),
                Value<String> nameSimple = const Value.absent(),
                Value<String> nameComplex = const Value.absent(),
                Value<String> nameArabic = const Value.absent(),
                Value<int> versesCount = const Value.absent(),
                Value<String> pages = const Value.absent(),
                Value<String> translatedName = const Value.absent(),
              }) => ChaptersCompanion(
                id: id,
                revelationPlace: revelationPlace,
                revelationOrder: revelationOrder,
                bismillahPre: bismillahPre,
                nameSimple: nameSimple,
                nameComplex: nameComplex,
                nameArabic: nameArabic,
                versesCount: versesCount,
                pages: pages,
                translatedName: translatedName,
              ),
          createCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                required String revelationPlace,
                required int revelationOrder,
                required bool bismillahPre,
                required String nameSimple,
                required String nameComplex,
                required String nameArabic,
                required int versesCount,
                required String pages,
                required String translatedName,
              }) => ChaptersCompanion.insert(
                id: id,
                revelationPlace: revelationPlace,
                revelationOrder: revelationOrder,
                bismillahPre: bismillahPre,
                nameSimple: nameSimple,
                nameComplex: nameComplex,
                nameArabic: nameArabic,
                versesCount: versesCount,
                pages: pages,
                translatedName: translatedName,
              ),
          withReferenceMapper: (p0) => p0
              .map(
                (e) => (
                  e.readTable(table),
                  $$ChaptersTableReferences(db, table, e),
                ),
              )
              .toList(),
          prefetchHooksCallback: ({versesRefs = false}) {
            return PrefetchHooks(
              db: db,
              explicitlyWatchedTables: [if (versesRefs) db.verses],
              addJoins: null,
              getPrefetchedDataCallback: (items) async {
                return [
                  if (versesRefs)
                    await $_getPrefetchedData<Chapter, $ChaptersTable, Verse>(
                      currentTable: table,
                      referencedTable: $$ChaptersTableReferences
                          ._versesRefsTable(db),
                      managerFromTypedResult: (p0) =>
                          $$ChaptersTableReferences(db, table, p0).versesRefs,
                      referencedItemsForCurrentItem: (item, referencedItems) =>
                          referencedItems.where((e) => e.chapterId == item.id),
                      typedResults: items,
                    ),
                ];
              },
            );
          },
        ),
      );
}

typedef $$ChaptersTableProcessedTableManager =
    ProcessedTableManager<
      _$QuranDatabase,
      $ChaptersTable,
      Chapter,
      $$ChaptersTableFilterComposer,
      $$ChaptersTableOrderingComposer,
      $$ChaptersTableAnnotationComposer,
      $$ChaptersTableCreateCompanionBuilder,
      $$ChaptersTableUpdateCompanionBuilder,
      (Chapter, $$ChaptersTableReferences),
      Chapter,
      PrefetchHooks Function({bool versesRefs})
    >;
typedef $$VersesTableCreateCompanionBuilder =
    VersesCompanion Function({
      Value<int> id,
      required int chapterId,
      required int verseNumber,
      required String verseKey,
      required int pageNumber,
      required int juzNumber,
      required int hizbNumber,
      required String textUthmani,
      Value<String?> qpcUthmaniHafs,
    });
typedef $$VersesTableUpdateCompanionBuilder =
    VersesCompanion Function({
      Value<int> id,
      Value<int> chapterId,
      Value<int> verseNumber,
      Value<String> verseKey,
      Value<int> pageNumber,
      Value<int> juzNumber,
      Value<int> hizbNumber,
      Value<String> textUthmani,
      Value<String?> qpcUthmaniHafs,
    });

final class $$VersesTableReferences
    extends BaseReferences<_$QuranDatabase, $VersesTable, Verse> {
  $$VersesTableReferences(super.$_db, super.$_table, super.$_typedResult);

  static $ChaptersTable _chapterIdTable(_$QuranDatabase db) => db.chapters
      .createAlias($_aliasNameGenerator(db.verses.chapterId, db.chapters.id));

  $$ChaptersTableProcessedTableManager get chapterId {
    final $_column = $_itemColumn<int>('chapter_id')!;

    final manager = $$ChaptersTableTableManager(
      $_db,
      $_db.chapters,
    ).filter((f) => f.id.sqlEquals($_column));
    final item = $_typedResult.readTableOrNull(_chapterIdTable($_db));
    if (item == null) return manager;
    return ProcessedTableManager(
      manager.$state.copyWith(prefetchedData: [item]),
    );
  }

  static MultiTypedResultKey<$WordsTable, List<Word>> _wordsRefsTable(
    _$QuranDatabase db,
  ) => MultiTypedResultKey.fromTable(
    db.words,
    aliasName: $_aliasNameGenerator(db.verses.id, db.words.verseId),
  );

  $$WordsTableProcessedTableManager get wordsRefs {
    final manager = $$WordsTableTableManager(
      $_db,
      $_db.words,
    ).filter((f) => f.verseId.id.sqlEquals($_itemColumn<int>('id')!));

    final cache = $_typedResult.readTableOrNull(_wordsRefsTable($_db));
    return ProcessedTableManager(
      manager.$state.copyWith(prefetchedData: cache),
    );
  }

  static MultiTypedResultKey<$VerseTranslationsTable, List<VerseTranslation>>
  _verseTranslationsRefsTable(_$QuranDatabase db) =>
      MultiTypedResultKey.fromTable(
        db.verseTranslations,
        aliasName: $_aliasNameGenerator(
          db.verses.id,
          db.verseTranslations.verseId,
        ),
      );

  $$VerseTranslationsTableProcessedTableManager get verseTranslationsRefs {
    final manager = $$VerseTranslationsTableTableManager(
      $_db,
      $_db.verseTranslations,
    ).filter((f) => f.verseId.id.sqlEquals($_itemColumn<int>('id')!));

    final cache = $_typedResult.readTableOrNull(
      _verseTranslationsRefsTable($_db),
    );
    return ProcessedTableManager(
      manager.$state.copyWith(prefetchedData: cache),
    );
  }
}

class $$VersesTableFilterComposer
    extends Composer<_$QuranDatabase, $VersesTable> {
  $$VersesTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get verseNumber => $composableBuilder(
    column: $table.verseNumber,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get verseKey => $composableBuilder(
    column: $table.verseKey,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get pageNumber => $composableBuilder(
    column: $table.pageNumber,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get juzNumber => $composableBuilder(
    column: $table.juzNumber,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get hizbNumber => $composableBuilder(
    column: $table.hizbNumber,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get textUthmani => $composableBuilder(
    column: $table.textUthmani,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get qpcUthmaniHafs => $composableBuilder(
    column: $table.qpcUthmaniHafs,
    builder: (column) => ColumnFilters(column),
  );

  $$ChaptersTableFilterComposer get chapterId {
    final $$ChaptersTableFilterComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.chapterId,
      referencedTable: $db.chapters,
      getReferencedColumn: (t) => t.id,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$ChaptersTableFilterComposer(
            $db: $db,
            $table: $db.chapters,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return composer;
  }

  Expression<bool> wordsRefs(
    Expression<bool> Function($$WordsTableFilterComposer f) f,
  ) {
    final $$WordsTableFilterComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.id,
      referencedTable: $db.words,
      getReferencedColumn: (t) => t.verseId,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$WordsTableFilterComposer(
            $db: $db,
            $table: $db.words,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return f(composer);
  }

  Expression<bool> verseTranslationsRefs(
    Expression<bool> Function($$VerseTranslationsTableFilterComposer f) f,
  ) {
    final $$VerseTranslationsTableFilterComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.id,
      referencedTable: $db.verseTranslations,
      getReferencedColumn: (t) => t.verseId,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$VerseTranslationsTableFilterComposer(
            $db: $db,
            $table: $db.verseTranslations,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return f(composer);
  }
}

class $$VersesTableOrderingComposer
    extends Composer<_$QuranDatabase, $VersesTable> {
  $$VersesTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get verseNumber => $composableBuilder(
    column: $table.verseNumber,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get verseKey => $composableBuilder(
    column: $table.verseKey,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get pageNumber => $composableBuilder(
    column: $table.pageNumber,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get juzNumber => $composableBuilder(
    column: $table.juzNumber,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get hizbNumber => $composableBuilder(
    column: $table.hizbNumber,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get textUthmani => $composableBuilder(
    column: $table.textUthmani,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get qpcUthmaniHafs => $composableBuilder(
    column: $table.qpcUthmaniHafs,
    builder: (column) => ColumnOrderings(column),
  );

  $$ChaptersTableOrderingComposer get chapterId {
    final $$ChaptersTableOrderingComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.chapterId,
      referencedTable: $db.chapters,
      getReferencedColumn: (t) => t.id,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$ChaptersTableOrderingComposer(
            $db: $db,
            $table: $db.chapters,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return composer;
  }
}

class $$VersesTableAnnotationComposer
    extends Composer<_$QuranDatabase, $VersesTable> {
  $$VersesTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<int> get verseNumber => $composableBuilder(
    column: $table.verseNumber,
    builder: (column) => column,
  );

  GeneratedColumn<String> get verseKey =>
      $composableBuilder(column: $table.verseKey, builder: (column) => column);

  GeneratedColumn<int> get pageNumber => $composableBuilder(
    column: $table.pageNumber,
    builder: (column) => column,
  );

  GeneratedColumn<int> get juzNumber =>
      $composableBuilder(column: $table.juzNumber, builder: (column) => column);

  GeneratedColumn<int> get hizbNumber => $composableBuilder(
    column: $table.hizbNumber,
    builder: (column) => column,
  );

  GeneratedColumn<String> get textUthmani => $composableBuilder(
    column: $table.textUthmani,
    builder: (column) => column,
  );

  GeneratedColumn<String> get qpcUthmaniHafs => $composableBuilder(
    column: $table.qpcUthmaniHafs,
    builder: (column) => column,
  );

  $$ChaptersTableAnnotationComposer get chapterId {
    final $$ChaptersTableAnnotationComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.chapterId,
      referencedTable: $db.chapters,
      getReferencedColumn: (t) => t.id,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$ChaptersTableAnnotationComposer(
            $db: $db,
            $table: $db.chapters,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return composer;
  }

  Expression<T> wordsRefs<T extends Object>(
    Expression<T> Function($$WordsTableAnnotationComposer a) f,
  ) {
    final $$WordsTableAnnotationComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.id,
      referencedTable: $db.words,
      getReferencedColumn: (t) => t.verseId,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$WordsTableAnnotationComposer(
            $db: $db,
            $table: $db.words,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return f(composer);
  }

  Expression<T> verseTranslationsRefs<T extends Object>(
    Expression<T> Function($$VerseTranslationsTableAnnotationComposer a) f,
  ) {
    final $$VerseTranslationsTableAnnotationComposer composer =
        $composerBuilder(
          composer: this,
          getCurrentColumn: (t) => t.id,
          referencedTable: $db.verseTranslations,
          getReferencedColumn: (t) => t.verseId,
          builder:
              (
                joinBuilder, {
                $addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer,
              }) => $$VerseTranslationsTableAnnotationComposer(
                $db: $db,
                $table: $db.verseTranslations,
                $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
                joinBuilder: joinBuilder,
                $removeJoinBuilderFromRootComposer:
                    $removeJoinBuilderFromRootComposer,
              ),
        );
    return f(composer);
  }
}

class $$VersesTableTableManager
    extends
        RootTableManager<
          _$QuranDatabase,
          $VersesTable,
          Verse,
          $$VersesTableFilterComposer,
          $$VersesTableOrderingComposer,
          $$VersesTableAnnotationComposer,
          $$VersesTableCreateCompanionBuilder,
          $$VersesTableUpdateCompanionBuilder,
          (Verse, $$VersesTableReferences),
          Verse,
          PrefetchHooks Function({
            bool chapterId,
            bool wordsRefs,
            bool verseTranslationsRefs,
          })
        > {
  $$VersesTableTableManager(_$QuranDatabase db, $VersesTable table)
    : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$VersesTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$VersesTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$VersesTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                Value<int> chapterId = const Value.absent(),
                Value<int> verseNumber = const Value.absent(),
                Value<String> verseKey = const Value.absent(),
                Value<int> pageNumber = const Value.absent(),
                Value<int> juzNumber = const Value.absent(),
                Value<int> hizbNumber = const Value.absent(),
                Value<String> textUthmani = const Value.absent(),
                Value<String?> qpcUthmaniHafs = const Value.absent(),
              }) => VersesCompanion(
                id: id,
                chapterId: chapterId,
                verseNumber: verseNumber,
                verseKey: verseKey,
                pageNumber: pageNumber,
                juzNumber: juzNumber,
                hizbNumber: hizbNumber,
                textUthmani: textUthmani,
                qpcUthmaniHafs: qpcUthmaniHafs,
              ),
          createCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                required int chapterId,
                required int verseNumber,
                required String verseKey,
                required int pageNumber,
                required int juzNumber,
                required int hizbNumber,
                required String textUthmani,
                Value<String?> qpcUthmaniHafs = const Value.absent(),
              }) => VersesCompanion.insert(
                id: id,
                chapterId: chapterId,
                verseNumber: verseNumber,
                verseKey: verseKey,
                pageNumber: pageNumber,
                juzNumber: juzNumber,
                hizbNumber: hizbNumber,
                textUthmani: textUthmani,
                qpcUthmaniHafs: qpcUthmaniHafs,
              ),
          withReferenceMapper: (p0) => p0
              .map(
                (e) =>
                    (e.readTable(table), $$VersesTableReferences(db, table, e)),
              )
              .toList(),
          prefetchHooksCallback:
              ({
                chapterId = false,
                wordsRefs = false,
                verseTranslationsRefs = false,
              }) {
                return PrefetchHooks(
                  db: db,
                  explicitlyWatchedTables: [
                    if (wordsRefs) db.words,
                    if (verseTranslationsRefs) db.verseTranslations,
                  ],
                  addJoins:
                      <
                        T extends TableManagerState<
                          dynamic,
                          dynamic,
                          dynamic,
                          dynamic,
                          dynamic,
                          dynamic,
                          dynamic,
                          dynamic,
                          dynamic,
                          dynamic,
                          dynamic
                        >
                      >(state) {
                        if (chapterId) {
                          state =
                              state.withJoin(
                                    currentTable: table,
                                    currentColumn: table.chapterId,
                                    referencedTable: $$VersesTableReferences
                                        ._chapterIdTable(db),
                                    referencedColumn: $$VersesTableReferences
                                        ._chapterIdTable(db)
                                        .id,
                                  )
                                  as T;
                        }

                        return state;
                      },
                  getPrefetchedDataCallback: (items) async {
                    return [
                      if (wordsRefs)
                        await $_getPrefetchedData<Verse, $VersesTable, Word>(
                          currentTable: table,
                          referencedTable: $$VersesTableReferences
                              ._wordsRefsTable(db),
                          managerFromTypedResult: (p0) =>
                              $$VersesTableReferences(db, table, p0).wordsRefs,
                          referencedItemsForCurrentItem:
                              (item, referencedItems) => referencedItems.where(
                                (e) => e.verseId == item.id,
                              ),
                          typedResults: items,
                        ),
                      if (verseTranslationsRefs)
                        await $_getPrefetchedData<
                          Verse,
                          $VersesTable,
                          VerseTranslation
                        >(
                          currentTable: table,
                          referencedTable: $$VersesTableReferences
                              ._verseTranslationsRefsTable(db),
                          managerFromTypedResult: (p0) =>
                              $$VersesTableReferences(
                                db,
                                table,
                                p0,
                              ).verseTranslationsRefs,
                          referencedItemsForCurrentItem:
                              (item, referencedItems) => referencedItems.where(
                                (e) => e.verseId == item.id,
                              ),
                          typedResults: items,
                        ),
                    ];
                  },
                );
              },
        ),
      );
}

typedef $$VersesTableProcessedTableManager =
    ProcessedTableManager<
      _$QuranDatabase,
      $VersesTable,
      Verse,
      $$VersesTableFilterComposer,
      $$VersesTableOrderingComposer,
      $$VersesTableAnnotationComposer,
      $$VersesTableCreateCompanionBuilder,
      $$VersesTableUpdateCompanionBuilder,
      (Verse, $$VersesTableReferences),
      Verse,
      PrefetchHooks Function({
        bool chapterId,
        bool wordsRefs,
        bool verseTranslationsRefs,
      })
    >;
typedef $$WordsTableCreateCompanionBuilder =
    WordsCompanion Function({
      Value<int> id,
      required int verseId,
      required int position,
      Value<String?> audioUrl,
      required String charTypeName,
      required String textUthmani,
      Value<String?> qpcUthmaniHafs,
      Value<String?> textUthmaniTajweed,
      required String translation,
      Value<String?> transliteration,
    });
typedef $$WordsTableUpdateCompanionBuilder =
    WordsCompanion Function({
      Value<int> id,
      Value<int> verseId,
      Value<int> position,
      Value<String?> audioUrl,
      Value<String> charTypeName,
      Value<String> textUthmani,
      Value<String?> qpcUthmaniHafs,
      Value<String?> textUthmaniTajweed,
      Value<String> translation,
      Value<String?> transliteration,
    });

final class $$WordsTableReferences
    extends BaseReferences<_$QuranDatabase, $WordsTable, Word> {
  $$WordsTableReferences(super.$_db, super.$_table, super.$_typedResult);

  static $VersesTable _verseIdTable(_$QuranDatabase db) => db.verses
      .createAlias($_aliasNameGenerator(db.words.verseId, db.verses.id));

  $$VersesTableProcessedTableManager get verseId {
    final $_column = $_itemColumn<int>('verse_id')!;

    final manager = $$VersesTableTableManager(
      $_db,
      $_db.verses,
    ).filter((f) => f.id.sqlEquals($_column));
    final item = $_typedResult.readTableOrNull(_verseIdTable($_db));
    if (item == null) return manager;
    return ProcessedTableManager(
      manager.$state.copyWith(prefetchedData: [item]),
    );
  }
}

class $$WordsTableFilterComposer
    extends Composer<_$QuranDatabase, $WordsTable> {
  $$WordsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get position => $composableBuilder(
    column: $table.position,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get audioUrl => $composableBuilder(
    column: $table.audioUrl,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get charTypeName => $composableBuilder(
    column: $table.charTypeName,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get textUthmani => $composableBuilder(
    column: $table.textUthmani,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get qpcUthmaniHafs => $composableBuilder(
    column: $table.qpcUthmaniHafs,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get textUthmaniTajweed => $composableBuilder(
    column: $table.textUthmaniTajweed,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get translation => $composableBuilder(
    column: $table.translation,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get transliteration => $composableBuilder(
    column: $table.transliteration,
    builder: (column) => ColumnFilters(column),
  );

  $$VersesTableFilterComposer get verseId {
    final $$VersesTableFilterComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.verseId,
      referencedTable: $db.verses,
      getReferencedColumn: (t) => t.id,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$VersesTableFilterComposer(
            $db: $db,
            $table: $db.verses,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return composer;
  }
}

class $$WordsTableOrderingComposer
    extends Composer<_$QuranDatabase, $WordsTable> {
  $$WordsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get position => $composableBuilder(
    column: $table.position,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get audioUrl => $composableBuilder(
    column: $table.audioUrl,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get charTypeName => $composableBuilder(
    column: $table.charTypeName,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get textUthmani => $composableBuilder(
    column: $table.textUthmani,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get qpcUthmaniHafs => $composableBuilder(
    column: $table.qpcUthmaniHafs,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get textUthmaniTajweed => $composableBuilder(
    column: $table.textUthmaniTajweed,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get translation => $composableBuilder(
    column: $table.translation,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get transliteration => $composableBuilder(
    column: $table.transliteration,
    builder: (column) => ColumnOrderings(column),
  );

  $$VersesTableOrderingComposer get verseId {
    final $$VersesTableOrderingComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.verseId,
      referencedTable: $db.verses,
      getReferencedColumn: (t) => t.id,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$VersesTableOrderingComposer(
            $db: $db,
            $table: $db.verses,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return composer;
  }
}

class $$WordsTableAnnotationComposer
    extends Composer<_$QuranDatabase, $WordsTable> {
  $$WordsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<int> get position =>
      $composableBuilder(column: $table.position, builder: (column) => column);

  GeneratedColumn<String> get audioUrl =>
      $composableBuilder(column: $table.audioUrl, builder: (column) => column);

  GeneratedColumn<String> get charTypeName => $composableBuilder(
    column: $table.charTypeName,
    builder: (column) => column,
  );

  GeneratedColumn<String> get textUthmani => $composableBuilder(
    column: $table.textUthmani,
    builder: (column) => column,
  );

  GeneratedColumn<String> get qpcUthmaniHafs => $composableBuilder(
    column: $table.qpcUthmaniHafs,
    builder: (column) => column,
  );

  GeneratedColumn<String> get textUthmaniTajweed => $composableBuilder(
    column: $table.textUthmaniTajweed,
    builder: (column) => column,
  );

  GeneratedColumn<String> get translation => $composableBuilder(
    column: $table.translation,
    builder: (column) => column,
  );

  GeneratedColumn<String> get transliteration => $composableBuilder(
    column: $table.transliteration,
    builder: (column) => column,
  );

  $$VersesTableAnnotationComposer get verseId {
    final $$VersesTableAnnotationComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.verseId,
      referencedTable: $db.verses,
      getReferencedColumn: (t) => t.id,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$VersesTableAnnotationComposer(
            $db: $db,
            $table: $db.verses,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return composer;
  }
}

class $$WordsTableTableManager
    extends
        RootTableManager<
          _$QuranDatabase,
          $WordsTable,
          Word,
          $$WordsTableFilterComposer,
          $$WordsTableOrderingComposer,
          $$WordsTableAnnotationComposer,
          $$WordsTableCreateCompanionBuilder,
          $$WordsTableUpdateCompanionBuilder,
          (Word, $$WordsTableReferences),
          Word,
          PrefetchHooks Function({bool verseId})
        > {
  $$WordsTableTableManager(_$QuranDatabase db, $WordsTable table)
    : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$WordsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$WordsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$WordsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                Value<int> verseId = const Value.absent(),
                Value<int> position = const Value.absent(),
                Value<String?> audioUrl = const Value.absent(),
                Value<String> charTypeName = const Value.absent(),
                Value<String> textUthmani = const Value.absent(),
                Value<String?> qpcUthmaniHafs = const Value.absent(),
                Value<String?> textUthmaniTajweed = const Value.absent(),
                Value<String> translation = const Value.absent(),
                Value<String?> transliteration = const Value.absent(),
              }) => WordsCompanion(
                id: id,
                verseId: verseId,
                position: position,
                audioUrl: audioUrl,
                charTypeName: charTypeName,
                textUthmani: textUthmani,
                qpcUthmaniHafs: qpcUthmaniHafs,
                textUthmaniTajweed: textUthmaniTajweed,
                translation: translation,
                transliteration: transliteration,
              ),
          createCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                required int verseId,
                required int position,
                Value<String?> audioUrl = const Value.absent(),
                required String charTypeName,
                required String textUthmani,
                Value<String?> qpcUthmaniHafs = const Value.absent(),
                Value<String?> textUthmaniTajweed = const Value.absent(),
                required String translation,
                Value<String?> transliteration = const Value.absent(),
              }) => WordsCompanion.insert(
                id: id,
                verseId: verseId,
                position: position,
                audioUrl: audioUrl,
                charTypeName: charTypeName,
                textUthmani: textUthmani,
                qpcUthmaniHafs: qpcUthmaniHafs,
                textUthmaniTajweed: textUthmaniTajweed,
                translation: translation,
                transliteration: transliteration,
              ),
          withReferenceMapper: (p0) => p0
              .map(
                (e) =>
                    (e.readTable(table), $$WordsTableReferences(db, table, e)),
              )
              .toList(),
          prefetchHooksCallback: ({verseId = false}) {
            return PrefetchHooks(
              db: db,
              explicitlyWatchedTables: [],
              addJoins:
                  <
                    T extends TableManagerState<
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic
                    >
                  >(state) {
                    if (verseId) {
                      state =
                          state.withJoin(
                                currentTable: table,
                                currentColumn: table.verseId,
                                referencedTable: $$WordsTableReferences
                                    ._verseIdTable(db),
                                referencedColumn: $$WordsTableReferences
                                    ._verseIdTable(db)
                                    .id,
                              )
                              as T;
                    }

                    return state;
                  },
              getPrefetchedDataCallback: (items) async {
                return [];
              },
            );
          },
        ),
      );
}

typedef $$WordsTableProcessedTableManager =
    ProcessedTableManager<
      _$QuranDatabase,
      $WordsTable,
      Word,
      $$WordsTableFilterComposer,
      $$WordsTableOrderingComposer,
      $$WordsTableAnnotationComposer,
      $$WordsTableCreateCompanionBuilder,
      $$WordsTableUpdateCompanionBuilder,
      (Word, $$WordsTableReferences),
      Word,
      PrefetchHooks Function({bool verseId})
    >;
typedef $$VerseTranslationsTableCreateCompanionBuilder =
    VerseTranslationsCompanion Function({
      Value<int> id,
      required int verseId,
      required int resourceId,
      required String translationText,
    });
typedef $$VerseTranslationsTableUpdateCompanionBuilder =
    VerseTranslationsCompanion Function({
      Value<int> id,
      Value<int> verseId,
      Value<int> resourceId,
      Value<String> translationText,
    });

final class $$VerseTranslationsTableReferences
    extends
        BaseReferences<
          _$QuranDatabase,
          $VerseTranslationsTable,
          VerseTranslation
        > {
  $$VerseTranslationsTableReferences(
    super.$_db,
    super.$_table,
    super.$_typedResult,
  );

  static $VersesTable _verseIdTable(_$QuranDatabase db) =>
      db.verses.createAlias(
        $_aliasNameGenerator(db.verseTranslations.verseId, db.verses.id),
      );

  $$VersesTableProcessedTableManager get verseId {
    final $_column = $_itemColumn<int>('verse_id')!;

    final manager = $$VersesTableTableManager(
      $_db,
      $_db.verses,
    ).filter((f) => f.id.sqlEquals($_column));
    final item = $_typedResult.readTableOrNull(_verseIdTable($_db));
    if (item == null) return manager;
    return ProcessedTableManager(
      manager.$state.copyWith(prefetchedData: [item]),
    );
  }
}

class $$VerseTranslationsTableFilterComposer
    extends Composer<_$QuranDatabase, $VerseTranslationsTable> {
  $$VerseTranslationsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get resourceId => $composableBuilder(
    column: $table.resourceId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get translationText => $composableBuilder(
    column: $table.translationText,
    builder: (column) => ColumnFilters(column),
  );

  $$VersesTableFilterComposer get verseId {
    final $$VersesTableFilterComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.verseId,
      referencedTable: $db.verses,
      getReferencedColumn: (t) => t.id,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$VersesTableFilterComposer(
            $db: $db,
            $table: $db.verses,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return composer;
  }
}

class $$VerseTranslationsTableOrderingComposer
    extends Composer<_$QuranDatabase, $VerseTranslationsTable> {
  $$VerseTranslationsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get resourceId => $composableBuilder(
    column: $table.resourceId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get translationText => $composableBuilder(
    column: $table.translationText,
    builder: (column) => ColumnOrderings(column),
  );

  $$VersesTableOrderingComposer get verseId {
    final $$VersesTableOrderingComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.verseId,
      referencedTable: $db.verses,
      getReferencedColumn: (t) => t.id,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$VersesTableOrderingComposer(
            $db: $db,
            $table: $db.verses,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return composer;
  }
}

class $$VerseTranslationsTableAnnotationComposer
    extends Composer<_$QuranDatabase, $VerseTranslationsTable> {
  $$VerseTranslationsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<int> get resourceId => $composableBuilder(
    column: $table.resourceId,
    builder: (column) => column,
  );

  GeneratedColumn<String> get translationText => $composableBuilder(
    column: $table.translationText,
    builder: (column) => column,
  );

  $$VersesTableAnnotationComposer get verseId {
    final $$VersesTableAnnotationComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.verseId,
      referencedTable: $db.verses,
      getReferencedColumn: (t) => t.id,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$VersesTableAnnotationComposer(
            $db: $db,
            $table: $db.verses,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return composer;
  }
}

class $$VerseTranslationsTableTableManager
    extends
        RootTableManager<
          _$QuranDatabase,
          $VerseTranslationsTable,
          VerseTranslation,
          $$VerseTranslationsTableFilterComposer,
          $$VerseTranslationsTableOrderingComposer,
          $$VerseTranslationsTableAnnotationComposer,
          $$VerseTranslationsTableCreateCompanionBuilder,
          $$VerseTranslationsTableUpdateCompanionBuilder,
          (VerseTranslation, $$VerseTranslationsTableReferences),
          VerseTranslation,
          PrefetchHooks Function({bool verseId})
        > {
  $$VerseTranslationsTableTableManager(
    _$QuranDatabase db,
    $VerseTranslationsTable table,
  ) : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$VerseTranslationsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$VerseTranslationsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$VerseTranslationsTableAnnotationComposer(
                $db: db,
                $table: table,
              ),
          updateCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                Value<int> verseId = const Value.absent(),
                Value<int> resourceId = const Value.absent(),
                Value<String> translationText = const Value.absent(),
              }) => VerseTranslationsCompanion(
                id: id,
                verseId: verseId,
                resourceId: resourceId,
                translationText: translationText,
              ),
          createCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                required int verseId,
                required int resourceId,
                required String translationText,
              }) => VerseTranslationsCompanion.insert(
                id: id,
                verseId: verseId,
                resourceId: resourceId,
                translationText: translationText,
              ),
          withReferenceMapper: (p0) => p0
              .map(
                (e) => (
                  e.readTable(table),
                  $$VerseTranslationsTableReferences(db, table, e),
                ),
              )
              .toList(),
          prefetchHooksCallback: ({verseId = false}) {
            return PrefetchHooks(
              db: db,
              explicitlyWatchedTables: [],
              addJoins:
                  <
                    T extends TableManagerState<
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic
                    >
                  >(state) {
                    if (verseId) {
                      state =
                          state.withJoin(
                                currentTable: table,
                                currentColumn: table.verseId,
                                referencedTable:
                                    $$VerseTranslationsTableReferences
                                        ._verseIdTable(db),
                                referencedColumn:
                                    $$VerseTranslationsTableReferences
                                        ._verseIdTable(db)
                                        .id,
                              )
                              as T;
                    }

                    return state;
                  },
              getPrefetchedDataCallback: (items) async {
                return [];
              },
            );
          },
        ),
      );
}

typedef $$VerseTranslationsTableProcessedTableManager =
    ProcessedTableManager<
      _$QuranDatabase,
      $VerseTranslationsTable,
      VerseTranslation,
      $$VerseTranslationsTableFilterComposer,
      $$VerseTranslationsTableOrderingComposer,
      $$VerseTranslationsTableAnnotationComposer,
      $$VerseTranslationsTableCreateCompanionBuilder,
      $$VerseTranslationsTableUpdateCompanionBuilder,
      (VerseTranslation, $$VerseTranslationsTableReferences),
      VerseTranslation,
      PrefetchHooks Function({bool verseId})
    >;
typedef $$DownloadedAudioTableCreateCompanionBuilder =
    DownloadedAudioCompanion Function({
      required int reciterId,
      required int chapterId,
      required String localPath,
      required DateTime downloadedAt,
      Value<int> rowid,
    });
typedef $$DownloadedAudioTableUpdateCompanionBuilder =
    DownloadedAudioCompanion Function({
      Value<int> reciterId,
      Value<int> chapterId,
      Value<String> localPath,
      Value<DateTime> downloadedAt,
      Value<int> rowid,
    });

class $$DownloadedAudioTableFilterComposer
    extends Composer<_$QuranDatabase, $DownloadedAudioTable> {
  $$DownloadedAudioTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get reciterId => $composableBuilder(
    column: $table.reciterId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get chapterId => $composableBuilder(
    column: $table.chapterId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get localPath => $composableBuilder(
    column: $table.localPath,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get downloadedAt => $composableBuilder(
    column: $table.downloadedAt,
    builder: (column) => ColumnFilters(column),
  );
}

class $$DownloadedAudioTableOrderingComposer
    extends Composer<_$QuranDatabase, $DownloadedAudioTable> {
  $$DownloadedAudioTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get reciterId => $composableBuilder(
    column: $table.reciterId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get chapterId => $composableBuilder(
    column: $table.chapterId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get localPath => $composableBuilder(
    column: $table.localPath,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get downloadedAt => $composableBuilder(
    column: $table.downloadedAt,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$DownloadedAudioTableAnnotationComposer
    extends Composer<_$QuranDatabase, $DownloadedAudioTable> {
  $$DownloadedAudioTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get reciterId =>
      $composableBuilder(column: $table.reciterId, builder: (column) => column);

  GeneratedColumn<int> get chapterId =>
      $composableBuilder(column: $table.chapterId, builder: (column) => column);

  GeneratedColumn<String> get localPath =>
      $composableBuilder(column: $table.localPath, builder: (column) => column);

  GeneratedColumn<DateTime> get downloadedAt => $composableBuilder(
    column: $table.downloadedAt,
    builder: (column) => column,
  );
}

class $$DownloadedAudioTableTableManager
    extends
        RootTableManager<
          _$QuranDatabase,
          $DownloadedAudioTable,
          DownloadedAudioData,
          $$DownloadedAudioTableFilterComposer,
          $$DownloadedAudioTableOrderingComposer,
          $$DownloadedAudioTableAnnotationComposer,
          $$DownloadedAudioTableCreateCompanionBuilder,
          $$DownloadedAudioTableUpdateCompanionBuilder,
          (
            DownloadedAudioData,
            BaseReferences<
              _$QuranDatabase,
              $DownloadedAudioTable,
              DownloadedAudioData
            >,
          ),
          DownloadedAudioData,
          PrefetchHooks Function()
        > {
  $$DownloadedAudioTableTableManager(
    _$QuranDatabase db,
    $DownloadedAudioTable table,
  ) : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$DownloadedAudioTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$DownloadedAudioTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$DownloadedAudioTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<int> reciterId = const Value.absent(),
                Value<int> chapterId = const Value.absent(),
                Value<String> localPath = const Value.absent(),
                Value<DateTime> downloadedAt = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => DownloadedAudioCompanion(
                reciterId: reciterId,
                chapterId: chapterId,
                localPath: localPath,
                downloadedAt: downloadedAt,
                rowid: rowid,
              ),
          createCompanionCallback:
              ({
                required int reciterId,
                required int chapterId,
                required String localPath,
                required DateTime downloadedAt,
                Value<int> rowid = const Value.absent(),
              }) => DownloadedAudioCompanion.insert(
                reciterId: reciterId,
                chapterId: chapterId,
                localPath: localPath,
                downloadedAt: downloadedAt,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$DownloadedAudioTableProcessedTableManager =
    ProcessedTableManager<
      _$QuranDatabase,
      $DownloadedAudioTable,
      DownloadedAudioData,
      $$DownloadedAudioTableFilterComposer,
      $$DownloadedAudioTableOrderingComposer,
      $$DownloadedAudioTableAnnotationComposer,
      $$DownloadedAudioTableCreateCompanionBuilder,
      $$DownloadedAudioTableUpdateCompanionBuilder,
      (
        DownloadedAudioData,
        BaseReferences<
          _$QuranDatabase,
          $DownloadedAudioTable,
          DownloadedAudioData
        >,
      ),
      DownloadedAudioData,
      PrefetchHooks Function()
    >;

class $QuranDatabaseManager {
  final _$QuranDatabase _db;
  $QuranDatabaseManager(this._db);
  $$ChaptersTableTableManager get chapters =>
      $$ChaptersTableTableManager(_db, _db.chapters);
  $$VersesTableTableManager get verses =>
      $$VersesTableTableManager(_db, _db.verses);
  $$WordsTableTableManager get words =>
      $$WordsTableTableManager(_db, _db.words);
  $$VerseTranslationsTableTableManager get verseTranslations =>
      $$VerseTranslationsTableTableManager(_db, _db.verseTranslations);
  $$DownloadedAudioTableTableManager get downloadedAudio =>
      $$DownloadedAudioTableTableManager(_db, _db.downloadedAudio);
}

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../controllers/search_controller.dart' as my_search;

class SearchScopeFilter extends StatelessWidget {
  const SearchScopeFilter({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.find<my_search.SearchController>();

    final scopes = const [
      ('all', 'All'),
      ('arabic', 'Arabic'),
      ('translation', 'Translation'),
    ];

    return Obx(() {
      final currentScope = controller.searchScope.value;

      return SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16.0),
        child: Row(
          children: scopes.map((entry) {
            final isSelected = currentScope == entry.$1;
            return Padding(
              padding: const EdgeInsets.only(right: 8.0),
              child: ChoiceChip(
                label: Text(entry.$2),
                selected: isSelected,
                onSelected: (selected) {
                  if (selected) {
                    controller.setScope(entry.$1);
                  }
                },
              ),
            );
          }).toList(),
        ),
      );
    });
  }
}

/* eslint-disable no-shadow */
import React, { useEffect, useImperativeHandle, useState } from 'react';
import { FlatList, TouchableOpacity, View, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from './styles';
import type { CheckboxTreeProps } from './model';
import _ from 'lodash';

const defaultProps = {
  style: {},
  textStyle: {},
  iconColor: 'black',
};

const CheckboxTreeComponent = React.forwardRef<any, CheckboxTreeProps>(
  (props, ref) => {
    const {
      keyField,
      textField,
      childField,
      childCheckField,
      style,
      textStyle,
      iconColor = 'black',
      iconSize = 26,
      openIcon,
      closeIcon,
      checkIcon,
      unCheckIcon,
      autoSelectParents = true,
      autoSelectChilds = true,
      renderItem,
    } = props;

    const [listData, setListData] = useState<any[]>([]);
    const [selectedData, setSelectedData] = useState<any[]>([]);
    const [showsData, setShowsData] = useState<any[]>([]);

    useImperativeHandle(ref, () => {
      return { clear };
    });

    useEffect(() => {
      updateListData(props.data || [])
    }, [props.data])

    useEffect(() => {
      updateSelectedData(props.selectedData || [])
    }, [props.selectedData])

    useEffect(() => {
      updateShowsData(props.showsData || [])
    }, [props.showsData])

    useEffect(() => {
      if (typeof props.onSelect == 'function') {
        props.onSelect(selectedData);
      }
    }, [selectedData])

    useEffect(() => {
      if (typeof props.onShow == 'function') {
        props.onShow(showsData)
      }
    }, [showsData])



    const clear = () => {
      setSelectedData([])
      setShowsData([])
    };


    const _renderIcon = (status: boolean) => {
      if (status) {
        if (checkIcon) {
          return checkIcon;
        } else {
          return (
            <Ionicons
              name="ios-checkbox-outline"
              size={iconSize}
              color={iconColor}
            />
          );
        }
      } else {
        if (unCheckIcon) {
          return unCheckIcon;
        } else {
          return (
            <Ionicons name="stop-outline" size={iconSize} color={iconColor} />
          );
        }
      }
    };

    const _exits = (list: any[], value: any) => {
      const idx = list.indexOf(value[keyField]);
      return idx >= 0;
    }
    const setParents = (tmpData: any) => {
      tmpData[childField]?.map((item: any) => {
        item.parent = tmpData;
        item = setParents(item);
        return item;
      })
      return tmpData;
    }
    const updateListData = (newData: any[]) => {
      newData = newData.map(item => setParents(item));
      setListData([...newData]);
    }
    const updateSelectedData = (newData: any[]) => {
      let tmpData = _.uniq(newData);
      setSelectedData([...tmpData]);
    }
    const updateShowsData = (newData: any[]) => {
      let tmpData = _.uniq(newData);
      setShowsData([...tmpData]);
    }

    const getIds = (list: any): any => {
      var tmp: any[] = []
      if (!list) return tmp;
      if (Array.isArray(list)) {
        list.map((item: any) => {
          tmp.push(item[keyField])
          const existsChild = childCheckField ? item[childCheckField] : item[childField]?.length > 0;
          if (existsChild) {
            const childs = getIds(item[childField])
            tmp = [...tmp, ...childs]
          };
        })
      }
      return tmp;
    }
    const removeItem = (value: any) => {
      const idx = selectedData.indexOf(value)
      if (idx >= 0) selectedData.splice(idx, 1)
    }
    const parent = (item: any, isTick: boolean) => {
      if (!item) return
      if (item[childField]) {
        if (isTick) {
          const check = item[childField].filter((child: any) => !_exits(selectedData, child));
          if (check.length === 0) selectedData.push(item[keyField])
        } else {
          removeItem(item[keyField])
        }
      }
      parent(item.parent, isTick);
    };

    const onTick = (item: any) => {
      var childs: any[] = [];
      selectedData.push(item[keyField])
      if (autoSelectParents) parent(item.parent, true);
      if (autoSelectChilds) childs = getIds(item[childField]);

      var tmp = [...selectedData, ...childs];
      updateSelectedData(tmp);
    };

    const onUnTick = (item: any) => {
      removeItem(item[keyField])
      if (autoSelectParents) parent(item.parent, false);
      if (autoSelectChilds) {
        const childs = getIds(item[childField]);
        childs.map((item: any) => removeItem(item))
      }
      updateSelectedData(selectedData)
    };

    const showChild = (item: any) => {
      const openIndex = showsData.findIndex(dItem => dItem == item[keyField]);
      var tmp = showsData;
      if (openIndex >= 0) tmp.splice(openIndex, 1);
      else tmp.push(item[keyField])
      updateShowsData(tmp)
    };
    const renderList = (item: any, childs: any, index: number) => {
      const isTick = selectedData.findIndex(dItem => dItem == item[keyField]) >= 0;
      const isOpen = showsData.findIndex(dItem => dItem == item[keyField]) >= 0;

      return (
        <View style={[styles.item, { marginLeft: iconSize }]} key={index}>
          {renderItem ? (
            renderItem({
              item: item,
              isSelect: isTick,
              isOpen: isOpen,
              onOpen: () => showChild(item),
              onClose: () => showChild(item),
              onSelect: () => { isTick ? onUnTick(item) : onTick(item) }
            })
          ) : (
            <View style={styles.rowItem}>
              {childs && childs.length > 0 ? (
                <TouchableOpacity onPress={() => showChild(item)}>
                  {isOpen ? (
                    openIcon ? openIcon
                      :
                      <Ionicons
                        name="ios-remove"
                        size={iconSize}
                        color={iconColor}
                      />
                  ) : closeIcon ? (
                    closeIcon
                  ) : (
                    <Ionicons
                      name="add-outline"
                      size={iconSize}
                      color={iconColor}
                    />
                  )}
                </TouchableOpacity>
              ) : (
                <Text style={{ width: iconSize }}>{`  `}</Text>
              )}
              <TouchableOpacity
                style={styles.flex1}
                onPress={() => {
                  if (isTick) onUnTick(item);
                  else onTick(item);
                }}
              >
                <View style={styles.center}>
                  {_renderIcon(isTick)}
                  <Text style={[styles.name, textStyle]} numberOfLines={3}>
                    {item[textField]}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
          {isOpen && <View style={[!isOpen && styles.height0]}>
            {childs &&
              childs.map((data: any, index: number) => renderList(data, data[childField], index))}
          </View>}
        </View>
      );
    };

    return (
      <View style={[styles.container, style]}>
        <FlatList
          data={listData}
          renderItem={({ item, index }) => renderList(item, item[childField], index)}
          keyExtractor={(_item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }
);

CheckboxTreeComponent.defaultProps = defaultProps;

export default CheckboxTreeComponent;
